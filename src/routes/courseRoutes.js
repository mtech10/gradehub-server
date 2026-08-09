import express from "express";
import * as courseController from "../controllers/courseController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createCourseValidator,
  updateCourseValidator,
} from "../validators/courseValidator.js";

const router = express.Router();

router.use(authenticate);

// Admin + Student
router.get(
  "/statistics",
  authorize("admin"),
  courseController.getCourseStatistics,
);

router.get("/", authorize("admin", "student"), courseController.getCourses);

router.get(
  "/:id",
  authorize("admin", "student"),
  validateUUID(),
  courseController.getCourseById,
);

// Admin only

router.post(
  "/",
  authorize("admin"),
  createCourseValidator,
  validate,
  courseController.createCourse,
);

router.put(
  "/:id",
  authorize("admin"),
  validateUUID(),
  updateCourseValidator,
  validate,
  courseController.updateCourse,
);

router.patch(
  "/:id/deactivate",
  authorize("admin"),
  validateUUID(),
  courseController.deactivateCourse,
);

router.patch(
  "/:id/restore",
  authorize("admin"),
  validateUUID(),
  courseController.restoreCourse,
);

export default router;
