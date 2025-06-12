import { defineFunction } from "@aws-amplify/backend";

export const createTracker = defineFunction({
  entry: "./handler.ts",
  name: "createTracker",
});
