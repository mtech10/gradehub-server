import { body } from "express-validator";

export const createDepartmentValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Department name must be between 3 and 150 characters"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Department code is required")
    .isLength({ max: 20 })
    .withMessage("Department code must not exceed 20 characters"),

  body("facultyId")
    .notEmpty()
    .withMessage("Faculty is required")
    .isUUID()
    .withMessage("Invalid Faculty ID"),

  body("hod").optional().trim(),

  body("description").optional().trim(),
];

export const updateDepartmentValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Department name must be between 3 and 150 characters"),

  body("code")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Department code must not exceed 20 characters"),

  body("facultyId").optional().isUUID().withMessage("Invalid Faculty ID"),

  body("hod").optional().trim(),

  body("description").optional().trim(),
];
