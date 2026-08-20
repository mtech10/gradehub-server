

import express from "express";
import multer from "multer"; 
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
const upload = multer({ storage: multer.memoryStorage() }); 

router.use(authenticate);

router.get(
  "/statistics",
  authorize("admin"),
  courseController.getCourseStatistics,
);
router.get("/", authorize("admin", "student"), courseController.getCourses);


router.post(
  "/upload",
  authorize("admin"),
  upload.single("file"),
  courseController.uploadBulkCourses,
);

router.get(
  "/:id",
  authorize("admin", "student"),
  validateUUID(),
  courseController.getCourseById,
);
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
