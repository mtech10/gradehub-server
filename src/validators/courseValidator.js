import { body } from "express-validator";

export const createCourseValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Course code is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Course code must be between 2 and 20 characters"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Course title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Course title must be between 3 and 255 characters"),

  body("creditUnit")
    .notEmpty()
    .withMessage("Credit unit is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("Credit unit must be between 1 and 10"),

  body("departmentId")
    .notEmpty()
    .withMessage("Department is required")
    .isUUID()
    .withMessage("Invalid Department ID"),

  body("levelId")
    .notEmpty()
    .withMessage("Level is required")
    .isUUID()
    .withMessage("Invalid Level ID"),

  // CHANGED: Replaced semesterId with semester and removed isUUID()
  body("semester")
    .trim()
    .notEmpty()
    .withMessage("Semester is required")
    .isString()
    .withMessage("Semester must be a valid text string"),

  body("description").optional().trim(),
];

export const updateCourseValidator = [
  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Course code must be between 2 and 20 characters"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Course title must be between 3 and 255 characters"),

  body("creditUnit")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Credit unit must be between 1 and 10"),

  body("departmentId").optional().isUUID().withMessage("Invalid Department ID"),

  body("levelId").optional().isUUID().withMessage("Invalid Level ID"),

  // CHANGED: Replaced semesterId with semester and removed isUUID()
  body("semester")
    .optional()
    .trim()
    .isString()
    .withMessage("Semester must be a valid text string"),

  body("description").optional().trim(),
];
