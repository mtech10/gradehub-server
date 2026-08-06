import { body } from "express-validator";

export const createResultValidator = [
  body("studentId")
    .notEmpty()
    .withMessage("Student is required")
    .isUUID()
    .withMessage("Invalid Student ID"),

  body("courseId")
    .notEmpty()
    .withMessage("Course is required")
    .isUUID()
    .withMessage("Invalid Course ID"),

  body("sessionId")
    .notEmpty()
    .withMessage("Session is required")
    .isUUID()
    .withMessage("Invalid Session ID"),

  body("semesterId")
    .notEmpty()
    .withMessage("Semester is required")
    .isUUID()
    .withMessage("Invalid Semester ID"),

  body("caScore")
    .notEmpty()
    .withMessage("CA Score is required")
    .isFloat({ min: 0, max: 30 })
    .withMessage("CA Score must be between 0 and 30"),

  body("examScore")
    .notEmpty()
    .withMessage("Exam Score is required")
    .isFloat({ min: 0, max: 70 })
    .withMessage("Exam Score must be between 0 and 70"),
];

export const updateResultValidator = [
  body("studentId").optional().isUUID().withMessage("Invalid Student ID"),

  body("courseId").optional().isUUID().withMessage("Invalid Course ID"),

  body("sessionId").optional().isUUID().withMessage("Invalid Session ID"),

  body("semesterId").optional().isUUID().withMessage("Invalid Semester ID"),

  body("caScore")
    .optional()
    .isFloat({ min: 0, max: 30 })
    .withMessage("CA Score must be between 0 and 30"),

  body("examScore")
    .optional()
    .isFloat({ min: 0, max: 70 })
    .withMessage("Exam Score must be between 0 and 70"),
];
