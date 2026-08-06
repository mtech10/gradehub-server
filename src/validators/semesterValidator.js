import { body } from "express-validator";

export const createSemesterValidator = [
  body("sessionId")
    .notEmpty()
    .withMessage("Session is required")
    .isUUID()
    .withMessage("Invalid Session ID"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Semester name is required")
    .isIn(["First Semester", "Second Semester", "Summer"])
    .withMessage("Invalid semester name"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date"),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }

      return true;
    }),
];

export const updateSemesterValidator = [
  body("sessionId").optional().isUUID().withMessage("Invalid Session ID"),

  body("name")
    .optional()
    .trim()
    .isIn(["First Semester", "Second Semester", "Summer"])
    .withMessage("Invalid semester name"),

  body("startDate").optional().isISO8601().withMessage("Invalid start date"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date")
    .custom((value, { req }) => {
      if (
        req.body.startDate &&
        new Date(value) <= new Date(req.body.startDate)
      ) {
        throw new Error("End date must be after start date");
      }

      return true;
    }),
];
