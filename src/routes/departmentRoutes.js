import express from "express";

import * as departmentController from "../controllers/departmentController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createDepartmentValidator,
  updateDepartmentValidator,
} from "../validators/departmentValidator.js";

import { getDepartmentStats } from "../controllers/departmentController.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.post(
  "/",
  createDepartmentValidator,
  validate,
  departmentController.createDepartment,
);

router.get(
  "/",
  authenticate,
  authorize("admin"),
  departmentController.getDepartments,
);

router.get("/stats", authenticate, authorize("admin"), getDepartmentStats);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUUID(),
  departmentController.getDepartmentById,
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUUID(),
  updateDepartmentValidator,
  validate,
  departmentController.updateDepartment,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("admin"),
  validateUUID(),
  departmentController.deactivateDepartment,
);

router.patch(
  "/:id/restore",
  authenticate,
  authorize("admin"),
  validateUUID(),
  departmentController.restoreDepartment,
);

export default router;
