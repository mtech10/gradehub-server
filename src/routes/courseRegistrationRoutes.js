import express from "express";

import * as courseRegistrationController from "../controllers/courseRegistrationController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createCourseRegistrationValidator,
  updateCourseRegistrationValidator,
} from "../validators/courseRegistrationValidator.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/current",
  authorize("student"),
  courseRegistrationController.getCurrentRegistration,
);

router.post(
  "/submit",
  authorize("student"),
  courseRegistrationController.submitRegistration,
);

router.post(
  "/",
  authorize("admin"),
  createCourseRegistrationValidator,
  validate,
  courseRegistrationController.createCourseRegistration,
);

router.get(
  "/",
  authorize("admin"),
  courseRegistrationController.getCourseRegistrations,
);

router.get(
  "/:id",
  authorize("admin"),
  validateUUID(),
  courseRegistrationController.getCourseRegistrationById,
);

router.put(
  "/:id",
  authorize("admin"),
  validateUUID(),
  updateCourseRegistrationValidator,
  validate,
  courseRegistrationController.updateCourseRegistration,
);

router.patch(
  "/:id/deactivate",
  authorize("admin"),
  validateUUID(),
  courseRegistrationController.deactivateCourseRegistration,
);

router.patch(
  "/:id/restore",
  authorize("admin"),
  validateUUID(),
  courseRegistrationController.restoreCourseRegistration,
);

export default router;
