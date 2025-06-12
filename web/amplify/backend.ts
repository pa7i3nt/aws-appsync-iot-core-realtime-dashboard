import { defineBackend } from "@aws-amplify/backend"
import { Policy, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { CfnTopicRule } from "aws-cdk-lib/aws-iot"
import { CfnMap, CfnTracker } from "aws-cdk-lib/aws-location"
import { auth } from "./auth/resource"
import { data } from "./data/resource"
import { createTracker } from "./functions/create-tracker-update-current-position/resource"
import { listSensors } from "./functions/list-sensors/resource"
import { sendSensorValue } from "./functions/send-sensor-value/resource"

const VERSION_NUMBER = 9

const backend = defineBackend({
  auth,
  data,
  listSensors,
  sendSensorValue,
  createTracker
});

// disable unauthenticated access
const { cfnIdentityPool } = backend.auth.resources.cfnResources;
cfnIdentityPool.allowUnauthenticatedIdentities = false;

// create tracker stack
const trackerStack = backend.createStack("tracker-stack")

// create a tracker
const tracker = new CfnTracker(trackerStack, `MyTracker${VERSION_NUMBER}`, {
  trackerName: `MyTracker${VERSION_NUMBER}`
})

const myTrackerPolicy = new Policy(trackerStack, "TrackerPolicy", {
  policyName: "myTrackerPolicy",
  statements: [
    new PolicyStatement({
      actions: [
        "*"
      ],
      resources: [tracker.attrArn],
    }),
  ],
});

backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(myTrackerPolicy);

// Mapping Resources
const geoStack = backend.createStack("geo-stack");

// create a map
const map = new CfnMap(geoStack, "Map", {
  mapName: `SensorMap${VERSION_NUMBER}`,
  description: "Sensor Map",
  configuration: {
    style: "VectorEsriDarkGrayCanvas",
  },
  pricingPlan: "RequestBasedUsage",
  tags: [
    {
      key: "name",
      value: `SensorMap${VERSION_NUMBER}`,
    },
  ],
});

// create an IAM policy to allow interacting with geo resource
const myGeoPolicy = new Policy(geoStack, "GeoPolicy", {
  policyName: "myGeoPolicy",
  statements: [
    new PolicyStatement({
      actions: [
        "geo:GetMapTile",
        "geo:GetMapSprites",
        "geo:GetMapGlyphs",
        "geo:GetMapStyleDescriptor",
      ],
      resources: [map.attrArn],
    }),
  ],
});

// apply the policy to the authenticated role
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(myGeoPolicy);

// patch the map resource to the expected output configuration
backend.addOutput({
  geo: {
    aws_region: geoStack.region,
    maps: {
      items: {
        [map.mapName]: {
          style: "VectorEsriDarkGrayCanvas",
        },
      },
      default: map.mapName,
    },
  },
});

// IoT Resources

// grant the list sensors function access to search all IoT devices
const listSensorsLambda = backend.listSensors.resources.lambda;

listSensorsLambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["iot:SearchIndex"],
    resources: ["arn:aws:iot:*:*:*"],
  })
);

const iotStack = backend.createStack("iot-stack");

const sendSensorValueLambda = backend.sendSensorValue.resources.lambda;

// custom lambda
const createTrackerLambda = backend.createTracker.resources.lambda
createTrackerLambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["iot:*"],
    resources: ["arn:aws:iot:*:*:*"],
  })
)
createTrackerLambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["*"],
    resources: ["arn:aws:geo:*:*:*"],
  })
)

// create a rule to process messages from the sensors - send them to the lambda function
const ruleSendSensorValue = new CfnTopicRule(iotStack, "SendSensorValueRule", {
  topicRulePayload: {
    sql: "select * as data, topic(4) as sensorId from 'dt/bay-health/SF/+/sensor-value'",
    actions: [
      {
        lambda: {
          functionArn: sendSensorValueLambda.functionArn,
        }
      },
      {
        lambda: {
          functionArn: createTrackerLambda.functionArn,
        },
      }
    ],
  },
});

// allow IoT rule to invoke the lambda function
sendSensorValueLambda.addPermission("AllowIoTInvoke", {
  principal: new ServicePrincipal("iot.amazonaws.com"),
  sourceArn: `arn:aws:iot:${iotStack.region}:${iotStack.account}:rule/SendSensorValueRule*`,
});

// // custom rule
// const ruleCreateTracker = new CfnTopicRule(iotStack, "CreateTrackerRule", {
//   topicRulePayload: {
//     sql: "select * as data, topic(4) as sensorId from 'dt/bay-health/SF/+/sensor-value'",
//     actions: [
//       {
//         lambda: {
//           functionArn: createTrackerLambda.functionArn,
//         }
//       }
//     ],
//   },
// });

createTrackerLambda.addPermission("AllowIoTInvoke", {
  principal: new ServicePrincipal("iot.amazonaws.com"),
  sourceArn: `arn:aws:iot:${iotStack.region}:${iotStack.account}:rule/CreateTrackerRule*`,
});
