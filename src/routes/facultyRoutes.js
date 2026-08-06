import express from "express";

import * as facultyController from "../controllers/facultyController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createFacultyValidator,
  updateFacultyValidator,
} from "../validators/facultyValidator.js";

const router = express.Router();

// Protect all routes
router.use(authenticate);
router.use(authorize("admin"));

// Create Faculty
router.post(
  "/",
  createFacultyValidator,
  validate,
  facultyController.createFaculty,
);

// Get All Faculties
router.get("/", facultyController.getFaculties);

// Get Faculty By ID
router.get("/:id", validateUUID(), facultyController.getFacultyById);

// Update Faculty
router.put(
  "/:id",
  validateUUID(),
  updateFacultyValidator,
  validate,
  facultyController.updateFaculty,
);

// Deactivate Faculty
router.patch(
  "/:id/deactivate",
  validateUUID(),
  facultyController.deactivateFaculty,
);

// Restore Faculty
router.patch("/:id/restore", validateUUID(), facultyController.restoreFaculty);

export default router;
