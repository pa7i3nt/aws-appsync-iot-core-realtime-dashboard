import { PreSignUpTriggerEvent } from 'aws-lambda';

export const handler = async (event: PreSignUpTriggerEvent) => {
  console.log('Pre sign-up trigger:', JSON.stringify(event, null, 2));
  
  // Auto-confirm users (optional)
  // event.response.autoConfirmUser = true;
  
  // Return the modified event
  return event;
};