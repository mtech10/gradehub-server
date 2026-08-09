import express from "express";

import * as courseRegistrationController from "../controllers/courseRegistrationController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validateUUID from "../middleware/validateUUID.js";

const router = express.Router();

router.use(authenticate);

/*
 * Student routes
 */
router.get(
  "/current",
  authorize("student"),
  courseRegistrationController.getCurrentRegistration,
);

router.post(
  "/submit",
  authorize("student"),
  courseRegistrationController.submitCourseRegistration,
);

router.get(
  "/me",
  authorize("student"),
  courseRegistrationController.getCurrentRegistration,
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

router.post(
  "/",
  authorize("admin"),
  courseRegistrationController.createCourseRegistration,
);

router.put(
  "/:id",
  authorize("admin"),
  validateUUID(),
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
