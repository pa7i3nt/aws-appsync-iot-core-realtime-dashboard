"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.postConfirmationTrigger = void 0;

const backend_1 = require("@aws-amplify/backend");

exports.postConfirmationTrigger = (0, backend_1.defineFunction)({
  name: "postConfirmationTrigger",
  entry: "./index.ts",
});

exports.default = exports.postConfirmationTrigger;