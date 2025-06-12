import { defineAuth } from '@aws-amplify/backend'

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      // Enable email verification during sign-up
      verificationEmailSubject: 'Verify your email for our IoT Dashboard',
      verificationEmailBody: (createCode: () => string) => `Thanks for signing up! Please verify your email by clicking this link: ${createCode()}`,
    },
  },
});
