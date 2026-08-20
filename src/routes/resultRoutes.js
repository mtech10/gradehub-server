import express from "express";

import * as resultController from "../controllers/resultController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import uploadResultFile from "../middleware/uploadResultFile.js";

import {
  createResultValidator,
  updateResultValidator,
} from "../validators/resultValidator.js";
import { resultUploadValidator } from "../validators/resultUploadValidator.js";

const router = express.Router();

router.use(authenticate);

router.get("/my-results", authorize("student"), resultController.getMyResults);

router.use(authorize("admin"));

router.post(
  "/",
  createResultValidator,
  validate,
  resultController.createResult,
);

router.post(
  "/upload/validate",
  uploadResultFile.single("file"),
  resultUploadValidator,
  validate,
  resultController.validateUpload,
);

router.post(
  "/upload",
  uploadResultFile.single("file"),
  resultUploadValidator,
  validate,
  resultController.uploadResults,
);

router.patch("/bulk-approve", resultController.bulkApproveResults);
router.delete("/bulk-delete", resultController.bulkDeleteResults);
router.patch("/bulk-deactivate", resultController.bulkDeactivateResults);

router.get("/", resultController.getResults);

router.get("/statistics", resultController.getResultStatistics);

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
