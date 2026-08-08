import { body } from "express-validator";

export const resultUploadValidator = [
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

  body("departmentId")
    .notEmpty()
    .withMessage("Department is required")
    .isUUID()
    .withMessage("Invalid Department ID"),

  body("courseId")
    .notEmpty()
    .withMessage("Course is required")
    .isUUID()
    .withMessage("Invalid Course ID"),

  body("levelId")
    .notEmpty()
    .withMessage("Level is required")
    .isUUID()
    .withMessage("Invalid Level ID"),

  body("uploadType")
    .notEmpty()
    .withMessage("Upload type is required")
    .isIn(["new", "supplementary"])
    .withMessage("Invalid upload type"),
];
