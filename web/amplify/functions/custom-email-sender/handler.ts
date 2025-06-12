import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  console.log('Custom email sender triggered:', JSON.stringify(event, null, 2));
  
  // Only handle verification emails
  if (event.triggerSource === "CustomEmailSender_SignUp" || 
      event.triggerSource === "CustomEmailSender_ResendCode") {
    
    const code = event.request.code;
    const userAttributes = event.request.userAttributes;
    const email = userAttributes.email;
    const username = event.userName;
    
    // Create verification link - replace with your actual domain
    const appDomain = process.env.APP_DOMAIN || 'master.d3o6jkn8hog6b5.amplifyapp.com';
    const verificationLink = `https://${appDomain}/verify?code=${code}&username=${username}`;
    
    // Use AWS SDK to send email via SES
    const AWS = require('aws-sdk');
    const ses = new AWS.SES({ region: process.env.REGION || 'ap-southeast-1' });
    
    const params = {
      Destination: { ToAddresses: [email] },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<html><body>
                   <h2>Verify your email address</h2>
                   <p>Thanks for signing up! Please click the link below to verify your email address:</p>
                   <p><a href="${verificationLink}">Verify Email</a></p>
                   </body></html>`
          },
          Text: {
            Charset: "UTF-8",
            Data: `Thanks for signing up! Please verify your email by clicking this link: ${verificationLink}`
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Verify your email for our IoT Dashboard"
        }
      },
      Source: process.env.EMAIL_SOURCE || "no-reply@example.com"
    };
    
    try {
      await ses.sendEmail(params).promise();
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Don't throw error to prevent blocking the auth flow
    }
  }
  
  return event;
}