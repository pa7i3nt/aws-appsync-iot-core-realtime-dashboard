import { defineFunction } from '@aws-amplify/backend';
import { auth } from '../../auth/resource';

export const customEmailTrigger = defineFunction({
  entry: './handler.ts',
});

// Connect the function to auth as a pre-sign-up trigger
auth.addPreSignUpTrigger(customEmailTrigger);