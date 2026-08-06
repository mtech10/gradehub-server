import express from "express";

import * as resultController from "../controllers/resultController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createResultValidator,
  updateResultValidator,
} from "../validators/resultValidator.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.post(
  "/",
  createResultValidator,
  validate,
  resultController.createResult,
);

router.get("/", resultController.getResults);

router.get("/:id", validateUUID(), resultController.getResultById);

router.put(
  "/:id",
  validateUUID(),
  updateResultValidator,
  validate,
  resultController.updateResult,
);

router.patch("/:id/approve", validateUUID(), resultController.approveResult);

router.patch(
  "/:id/deactivate",
  validateUUID(),
  resultController.deactivateResult,
);

router.patch("/:id/restore", validateUUID(), resultController.restoreResult);

export default router;
