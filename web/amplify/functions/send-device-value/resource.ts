import { defineFunction } from "@aws-amplify/backend";

export const sendDeviceValue = defineFunction({
  entry: "./handler.ts",
  name: "sendDeviceValue",
  resourceGroupName: "data",
});
