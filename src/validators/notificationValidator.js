import { body } from "express-validator";

export const createNotificationValidator = [
  body("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isUUID()
    .withMessage("Invalid Student ID"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters"),

  body("message").trim().notEmpty().withMessage("Message is required"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["academic", "result", "system", "reminder"])
    .withMessage("Invalid notification category"),
];
