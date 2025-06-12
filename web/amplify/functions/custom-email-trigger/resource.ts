import { defineFunction } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export const customEmailTrigger = defineFunction({
  entry: './handler.ts',
  resourceGroupName: 'auth',
});