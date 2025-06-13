import { CustomMessageTriggerHandler } from 'aws-lambda';

type CustomMessageEvent = Parameters<CustomMessageTriggerHandler>[0];

export const handler = async (event: CustomMessageEvent) => {
  console.log('Custom message trigger:', JSON.stringify(event, null, 2));
  
  if (event.triggerSource === 'CustomMessage_SignUp' || event.triggerSource === 'CustomMessage_ResendCode') {
    // For link-based verification - use the Cognito-provided link directly
    const { linkParameter } = event.request;
    
    // Customize the email message with the Cognito-provided verification link
    event.response.emailMessage = `
      <html>
        <body>
          <h2>Welcome to IoT Dashboard!</h2>
          <p>Please click the link below to verify your email address:</p>
          <p>
            <a href="${linkParameter}">Verify Email</a>
          </p>
          <p>If the link doesn't work, copy and paste this URL into your browser:</p>
          <p>${linkParameter}</p>
        </body>
      </html>
    `;
    
    event.response.emailSubject = 'Verify your email for IoT Dashboard';
  }
  
  return event;
};