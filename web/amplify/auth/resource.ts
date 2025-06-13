import { defineAuth } from '@aws-amplify/backend'

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
import { defineFunction } from '@aws-amplify/backend';

const postConfirmationFunction = defineFunction({
  name: 'postConfirmationTrigger',
  entry: '../functions/post-confirmation/index.ts',
});

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
    },
  },
  triggers: {
    postConfirmation: postConfirmationFunction
  }
});
