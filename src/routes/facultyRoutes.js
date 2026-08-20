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

router.use(authenticate);
router.use(authorize("admin"));

router.post(
  "/",
  createFacultyValidator,
  validate,
  facultyController.createFaculty,
);

router.get("/", facultyController.getFaculties);

router.get("/:id", validateUUID(), facultyController.getFacultyById);

router.put(
  "/:id",
  validateUUID(),
  updateFacultyValidator,
  validate,
  facultyController.updateFaculty,
);

router.patch(
  "/:id/deactivate",
  validateUUID(),
  facultyController.deactivateFaculty,
);

router.patch("/:id/restore", validateUUID(), facultyController.restoreFaculty);

export default router;
