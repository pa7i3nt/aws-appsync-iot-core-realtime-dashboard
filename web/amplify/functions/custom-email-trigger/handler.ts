import { PreSignUpTriggerEvent } from 'aws-lambda';

export const handler = async (event: PreSignUpTriggerEvent) => {
  console.log('Pre sign-up trigger:', JSON.stringify(event, null, 2));
  
  // Auto-confirm users to enable link-based verification
  event.response.autoConfirmUser = true;
  
  // Don't auto-verify email, let the user click the link
  event.response.autoVerifyEmail = false;
  
  return event;
};