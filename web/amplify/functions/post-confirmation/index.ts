import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { LocationClient, CreateGeofenceCollectionCommand } from '@aws-sdk/client-location';

const locationClient = new LocationClient({ region: 'ap-southeast-1' });

type PostConfirmationEvent = Parameters<PostConfirmationTriggerHandler>[0];

export const handler = async (event: PostConfirmationEvent) => {
  // Get user ID from Cognito event
  const userId = event.request.userAttributes.sub;
  
  try {
    // Create geofence collection with user ID
    const collectionName = `user-${userId}-geofences`;
    
    const command = new CreateGeofenceCollectionCommand({
      CollectionName: collectionName,
      Description: `Geofence collection for user ${userId}`
    });
    
    await locationClient.send(command);
    
    console.log(`Created geofence collection: ${collectionName}`);
  } catch (error) {
    console.error('Error creating geofence collection:', error);
    // Don't throw error to allow verification to complete
  }
  
  return event;
};