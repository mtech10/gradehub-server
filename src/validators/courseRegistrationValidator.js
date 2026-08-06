import { body } from "express-validator";

export const createCourseRegistrationValidator = [
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
];

export const updateCourseRegistrationValidator = [
  body("studentId").optional().isUUID().withMessage("Invalid Student ID"),

  body("courseId").optional().isUUID().withMessage("Invalid Course ID"),

  body("sessionId").optional().isUUID().withMessage("Invalid Session ID"),

  body("semesterId").optional().isUUID().withMessage("Invalid Semester ID"),
];
