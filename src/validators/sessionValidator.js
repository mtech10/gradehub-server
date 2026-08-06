import { body } from "express-validator";

export const createSessionValidator = [
  body("name").trim().notEmpty().withMessage("Session name is required"),

  body("startdate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date"),

  body("enddate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startdate)) {
        throw new Error("End date must be after start date");
      }

      return true;
    }),
];

export const updateSessionValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Session name cannot be empty"),

  body("startdate").optional().isISO8601().withMessage("Invalid start date"),

  body("enddate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date")
    .custom((value, { req }) => {
      if (
        req.body.startdate &&
        new Date(value) <= new Date(req.body.startdate)
      ) {
        throw new Error("End date must be after start date");
      }

      return true;
    }),
];
