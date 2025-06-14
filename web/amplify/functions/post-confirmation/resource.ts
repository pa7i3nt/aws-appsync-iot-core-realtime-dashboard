import { defineFunction } from "@aws-amplify/backend";

export const postConfirmationTrigger = defineFunction({
  name: "postConfirmationTrigger",
  entry: "./index.ts",
});