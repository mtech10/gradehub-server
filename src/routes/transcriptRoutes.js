import express from "express";

import * as transcriptController from "../controllers/transcriptController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validateUUID from "../middleware/validateUUID.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/:studentId",
  authorize("admin"),
  validateUUID("studentId"),
  transcriptController.getStudentTranscript,
);

export default router;
