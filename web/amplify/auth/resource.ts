import { defineAuth } from '@aws-amplify/backend'
import { customEmailSender } from '../functions/custom-email-sender/resource'

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Configure custom email sender for verification emails
  customEmailSender: {
    lambda: customEmailSender,
  },
});
