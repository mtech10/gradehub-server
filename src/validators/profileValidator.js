import { body } from "express-validator";

export const updateStudentProfileValidator = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),

  body("middleName").optional().trim(),

  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Invalid phone number"),
];

export const updateAdminProfileValidator = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),

  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),

  body("department").optional().trim(),

  body("position").optional().trim(),

  body("office").optional().trim(),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Invalid phone number"),
];

export const updateEmailValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
];

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const updatePhotoValidator = [
  body("photo").trim().notEmpty().withMessage("Photo is required"),
];
