import { body } from "express-validator";

export const createStudentValidator = [
  body("matricNumber")
    .trim()
    .notEmpty()
    .withMessage("Matric number is required")
    .isLength({ max: 30 })
    .withMessage("Matric number must not exceed 30 characters"),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("First name must be between 2 and 100 characters"),

  body("middleName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Middle name must not exceed 100 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Last name must be between 2 and 100 characters"),

  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female"])
    .withMessage("Gender must be either Male or Female"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Phone number must not exceed 20 characters"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date of birth"),

  body("admissionYear")
    .notEmpty()
    .withMessage("Admission year is required")
    .isInt({ min: 2000 })
    .withMessage("Invalid admission year"),

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

  body("sessionId")
    .notEmpty()
    .withMessage("Session is required")
    .isUUID()
    .withMessage("Invalid Session ID"),

  body("photo")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Photo URL is too long"),
];

export const updateStudentValidator = [
  body("matricNumber")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Matric number must not exceed 30 characters"),

  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("First name must be between 2 and 100 characters"),

  body("middleName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Middle name must not exceed 100 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Last name must be between 2 and 100 characters"),

  body("gender")
    .optional()
    .isIn(["Male", "Female"])
    .withMessage("Gender must be either Male or Female"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Phone number must not exceed 20 characters"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date of birth"),

  body("admissionYear")
    .optional()
    .isInt({ min: 2000 })
    .withMessage("Invalid admission year"),

  body("departmentId").optional().isUUID().withMessage("Invalid Department ID"),

  body("levelId").optional().isUUID().withMessage("Invalid Level ID"),

  body("sessionId").optional().isUUID().withMessage("Invalid Session ID"),

  body("photo")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Photo URL is too long"),
];
