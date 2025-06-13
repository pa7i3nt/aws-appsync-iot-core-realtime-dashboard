import { defineFunction } from '@aws-amplify/backend';

export const customEmailTrigger = defineFunction({
  entry: './handler.ts',
  resourceGroupName: 'auth',
});