import express from "express";

import * as facultyController from "../controllers/facultyController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createFacultySchema,
  updateFacultySchema,
} from "../validators/facultyValidator.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.post(
  "/",
  validate(createFacultySchema),
  facultyController.createFaculty,
);

router.get("/", facultyController.getFaculties);

router.get("/:id", validateUUID("id"), facultyController.getFacultyById);

router.put(
  "/:id",
  validateUUID("id"),
  validate(updateFacultySchema),
  facultyController.updateFaculty,
);

router.patch(
  "/:id/deactivate",
  validateUUID("id"),
  facultyController.deactivateFaculty,
);

router.patch(
  "/:id/restore",
  validateUUID("id"),
  facultyController.restoreFaculty,
);

export default router;
