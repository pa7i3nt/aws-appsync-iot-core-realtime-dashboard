import { CustomMessageTriggerHandler } from 'aws-lambda';

type CustomMessageEvent = Parameters<CustomMessageTriggerHandler>[0];

export const handler = async (event: CustomMessageEvent) => {
  console.log('Custom message trigger:', JSON.stringify(event, null, 2));
  
  if (event.triggerSource === 'CustomMessage_SignUp' || event.triggerSource === 'CustomMessage_ResendCode') {
    // For code-based verification
    const { codeParameter } = event.request;
    const { userName } = event;
    
    // Get the app URL
    const appUrl = 'http://localhost:5173';
    
    // Create a verification link that points to your app's verify page with the code
    const verificationLink = `${appUrl}/verify?username=${userName}&code=${codeParameter}`;
    
    // Customize the email message with the custom verification link
    event.response.emailMessage = 
      "<html>" +
      "<body>" +
      "<h2>Welcome to IoT Dashboard!</h2>" +
      "<p>Please click the link below to verify your email address:</p>" +
      "<p>" +
      "<a href=\"" + verificationLink + "\">Verify Email</a>" +
      "</p>" +
      "<p>If the link doesn't work, copy and paste this URL into your browser:</p>" +
      "<p>" + verificationLink + "</p>" +
      "</body>" +
      "</html>";
    
    event.response.emailSubject = 'Verify your email for IoT Dashboard';
  }
  
  return event;
};