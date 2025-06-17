import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import type { Handler } from 'aws-lambda'

export interface GeofenceBreachDetail {
  EventType: string
  GeofenceId: string
  DeviceId: string
  SampleTime: string
  Position: [number, number]
}

const AWS_REGION = process.env.AWS_REGION || ''

const ses = new SESClient({ region: AWS_REGION })

export const handler: Handler = async (event) => {
  // console.log('Received geofence breach event:', JSON.stringify(event, null, 2))

  // try {
  //   // Extract relevant information from the event
  //   const { detail } = event
  //   const { DeviceId, GeofenceId, Position, SampleTime } = detail

  //   // Log the geofence breach
  //   console.log(
  //     `ALERT: Device ${DeviceId} has breached geofence ${GeofenceId} at position ${JSON.stringify(Position)} at ${SampleTime}`
  //   )

  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify({
  //       message: 'Geofence breach logged successfully',
  //       detail
  //     })
  //   }
  // } catch (error) {
  //   console.error('Error processing geofence breach event:', error)
  //   return {
  //     statusCode: 500,
  //     body: JSON.stringify({
  //       message: 'Error processing geofence breach event',
  //       error: (error as Error).message
  //     })
  //   }
  // }

  try {
    console.log('event: ', event)

    const sendEmailCommand = new SendEmailCommand({
      Destination: {
        ToAddresses: ['admin@lighthappy.org']
      },
      Message: {
        Body: {
          Text: { Data: JSON.stringify(event) }
        },

        Subject: { Data: 'EventBridge Notification' }
      },
      Source: 'admin@lighthappy.org'
    })

    const response = await ses.send(sendEmailCommand)
    return response
  } catch (error) {
    console.error('Error sending email: ', error)
    throw error
  } finally {
    console.log('Done sending email.')
  }
}
