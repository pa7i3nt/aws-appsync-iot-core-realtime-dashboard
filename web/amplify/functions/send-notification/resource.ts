import { defineFunction } from "@aws-amplify/backend";

export const sendNotification = defineFunction({
  entry: "./handler.ts",
  name: "sendNotification",
  resourceGroupName: "data",
});
