import type { Handler } from 'aws-lambda'
import { CreateTrackerCommand, LocationClient } from '@aws-sdk/client-location'

const AWS_REGION = process.env.AWS_REGION || ''

export const handler: Handler = async (event) => {
  console.log('event', event)

  const createTrackerParams = {
    TrackerName: `CreateTrackerFromListSensor2`
  }
  const locationClient = new LocationClient({ region: AWS_REGION })
  try {
    const command = new CreateTrackerCommand(createTrackerParams)
    const response = await locationClient.send(command)

    console.log('Tracker created. Tracker name is : ', response.TrackerName)
  } catch (error) {
    console.error('Error creating map: ', error)
    throw error
  }

  // return "CreateTracker function triggered!"
}
