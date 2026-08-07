import { param } from "express-validator";

export const getTranscriptValidator = [
  param("studentId").isUUID().withMessage("Valid student ID is required"),
];
