import { defineFunction } from "@aws-amplify/backend";

const postConfirmationTrigger = defineFunction({
  name: "postConfirmationTrigger",
  entry: "./index.js",
});

export { postConfirmationTrigger };