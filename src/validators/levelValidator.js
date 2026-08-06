import { body } from "express-validator";

export const createLevelValidator = [
  body("name").trim().notEmpty().withMessage("Level name is required"),

  body("description").optional().trim(),
];

export const updateLevelValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Level name cannot be empty"),

  body("description").optional().trim(),
];
