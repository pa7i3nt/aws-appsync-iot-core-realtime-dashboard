import { type ClientSchema, a, defineData } from '@aws-amplify/backend'
import { createTracker } from '../functions/create-tracker-update-current-position/resource'
import { listSensors } from '../functions/list-sensors/resource'
import { sendSensorValue } from '../functions/send-sensor-value/resource'

const schema = a
  .schema({
    
    /* ***** ORIGINAL ***** */
    Geo: a.customType({
      latitude: a.float(),
      longitude: a.float()
    }),
    
    SensorValue: a.model({
      id: a.id(),
      sensorId: a.string().required(),
      pH: a.float().required(),
      temperature: a.float().required(),
      salinity: a.float().required(),
      disolvedO2: a.float().required(),
      status: a.integer().required(),
      geo: a.ref('Geo').required(),
      timestamp: a.timestamp().required()
    }),

    Sensor: a.customType({
      sensorId: a.string().required(),
      name: a.string().required(),
      geo: a.ref('Geo').required(),
      enabled: a.boolean().required(),
      status: a.integer().required()
    }),

    // listDevices by userId
    listSensors: a
      .query()
      .returns(a.ref('Sensor').array())
      .handler(a.handler.function(listSensors)),
      
    /* ***** OUR SCHEMA ***** */

    UserData: a.model({
      userId: a.id(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.string().required(),
      phone: a.string(),
      geofenceCollectionId: a.string(),
      // timestamp: a.timestamp().required()
    }),

    TrackerData: a.model({
      trackerId: a.string().required(),
      geofenceCollectionId: a.string().required(),
      userId: a.string().required(),
      deviceId: a.string().required(),
      deviceType: a.string(),
      geo: a.ref('Geo').required(),
      // timestamp: a.timestamp().required()
    }),
    
    UserDeviceMapping: a.model({
      id: a.id(),
      userId: a.string().required(),
      deviceId: a.string().required(),
      // timestamp: a.timestamp().required()
    }),
    
    Device: a.customType({
      deviceType: a.string(),
    }),
    
    Position: a.customType({
      latitude: a.float(),
      longitude: a.float(),
    }),
    
    DeviceValue: a.model({
      id: a.id(),
      deviceId: a.string().required(),
      device: a.ref('Device').required(),
      position: a.ref('Position').required(),
      timestamp: a.timestamp().required()
    })
  })
  .authorization((allow) => [
    allow.authenticated(),
    allow.resource(sendSensorValue),
    allow.resource(createTracker)
  ])

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  }
})
