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
router.use(authorize("admin"));

router.post(
  "/",
  createCourseRegistrationValidator,
  validate,
  courseRegistrationController.createCourseRegistration,
);

router.get("/", courseRegistrationController.getCourseRegistrations);

router.get(
  "/:id",
  validateUUID(),
  courseRegistrationController.getCourseRegistrationById,
);

router.put(
  "/:id",
  validateUUID(),
  updateCourseRegistrationValidator,
  validate,
  courseRegistrationController.updateCourseRegistration,
);

router.patch(
  "/:id/deactivate",
  validateUUID(),
  courseRegistrationController.deactivateCourseRegistration,
);

router.patch(
  "/:id/restore",
  validateUUID(),
  courseRegistrationController.restoreCourseRegistration,
);

export default router;
