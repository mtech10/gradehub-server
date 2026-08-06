import { body } from "express-validator";

export const createFacultyValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Faculty name is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Faculty name must be between 3 and 150 characters"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Faculty code is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Faculty code must be between 2 and 20 characters"),

  body("dean")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Dean name must not exceed 150 characters"),

  body("description").optional().trim(),
];

export const updateFacultyValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Faculty name must be between 3 and 150 characters"),

  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Faculty code must be between 2 and 20 characters"),

  body("dean")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Dean name must not exceed 150 characters"),

  body("description").optional().trim(),
];
