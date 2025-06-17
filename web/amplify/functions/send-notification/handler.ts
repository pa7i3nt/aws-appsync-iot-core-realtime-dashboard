import type { Handler } from 'aws-lambda'

export interface GeofenceBreachDetail {
  EventType: string
  GeofenceId: string
  DeviceId: string
  SampleTime: string
  Position: [number, number]
}

export const handler: Handler = async (event) => {
  console.log('Received geofence breach event:', JSON.stringify(event, null, 2))

  try {
    // Extract relevant information from the event
    const { detail } = event
    const { DeviceId, GeofenceId, Position, SampleTime } = detail

    // Log the geofence breach
    console.log(
      `ALERT: Device ${DeviceId} has breached geofence ${GeofenceId} at position ${JSON.stringify(Position)} at ${SampleTime}`
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Geofence breach logged successfully',
        detail
      })
    }
  } catch (error) {
    console.error('Error processing geofence breach event:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing geofence breach event',
        error: (error as Error).message
      })
    }
  }
}
