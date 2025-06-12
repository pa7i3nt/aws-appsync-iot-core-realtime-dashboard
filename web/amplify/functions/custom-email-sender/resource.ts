import { defineFunction } from '@aws-amplify/backend';

export const customEmailSender = defineFunction({
  name: 'customEmailSender',
  entry: './handler.ts',
  environment: {
    APP_DOMAIN: process.env.APP_DOMAIN || 'localhost:5173',
    EMAIL_SOURCE: process.env.EMAIL_SOURCE || 'no-reply@example.com'
  },
  permissions: [
    {
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*']
    }
  ]
});