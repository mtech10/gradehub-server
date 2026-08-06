import express from "express";

import * as studentController from "../controllers/studentController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createStudentValidator,
  updateStudentValidator,
} from "../validators/studentValidator.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.post(
  "/",
  createStudentValidator,
  validate,
  studentController.createStudent,
);

router.get("/", studentController.getStudents);

router.get("/:id", validateUUID(), studentController.getStudentById);

router.put(
  "/:id",
  validateUUID(),
  updateStudentValidator,
  validate,
  studentController.updateStudent,
);

router.patch(
  "/:id/deactivate",
  validateUUID(),
  studentController.deactivateStudent,
);

router.patch("/:id/restore", validateUUID(), studentController.restoreStudent);

export default router;
