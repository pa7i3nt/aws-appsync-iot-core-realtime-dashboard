const awsIot = require('aws-iot-device-sdk')

//load the sensors file that contains the location of the device certificates and the clientId of the sensor
var sensors = require('./sensors.json')

//constants used in the application
const SHADOW_TOPIC = '$aws/things/[thingName]/shadow/update'
const VALUE_TOPIC = 'dt/bay-health/SF/[thingName]/device-value' //topic to which sensor values will be published

//shadow document to be transmitted at statup
var shadowDocument = {
  state: {
    reported: {
      device: {
        deviceType: ''
      },
      position: {
        latitude: 0,
        longitude: 0
      }
    }
  }
}

async function run(sensor) {
  //initialize the IOT device
  var device = awsIot.device(sensor.settings)

  //create a placeholder for the message
  var msg = {
    device: {
      deviceType: ''
    },
    position: {
      latitude: 0,
      longitude: 0
    },
    timestamp: new Date().getTime()
  }

  device.on('connect', function () {
    console.log('connected to IoT Hub')

    //publish the shadow document for the sensor
    var topic = SHADOW_TOPIC.replace('[thingName]', sensor.settings.clientId)

    shadowDocument.state.reported.device.deviceType = sensor.device.deviceType
    shadowDocument.state.reported.position.latitude = sensor.position.latitude
    shadowDocument.state.reported.position.longitude = sensor.position.longitude

    device.publish(topic, JSON.stringify(shadowDocument))

    console.log(
      'published to shadow topic ' +
        topic +
        ' ' +
        JSON.stringify(shadowDocument)
    )

    //publish new value readings based on value_rate
    msg.device.deviceType = sensor.device.deviceType
    msg.position.latitude = sensor.position.latitude
    msg.position.longitude = sensor.position.longitude
    msg.timestamp = new Date().getTime()

    //publish the sensor reading message
    var topic = VALUE_TOPIC.replace('[thingName]', sensor.settings.clientId)

    device.publish(topic, JSON.stringify(msg))

    console.log(
      'published to telemetry topic ' + topic + ' ' + JSON.stringify(msg)
    )
  })

  device.on('error', function (error) {
    console.log('Error: ', error)
  })
}

//run simulation for each sensor
sensors.forEach((sensor) => {
  run(sensor)
})
