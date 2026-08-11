import express from "express";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createSemesterValidator,
  updateSemesterValidator,
} from "../validators/semesterValidator.js";

import {
  create,
  getAll,
  getOne,
  update,
  makeCurrent,
  deactivate,
  restore,
} from "../controllers/semesterController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAll);
router.get("/:id", validateUUID(), getOne);

router.post(
  "/",
  authorize("admin"),
  ...createSemesterValidator,
  validate,
  create,
);
router.put(
  "/:id",
  authorize("admin"),
  validateUUID(),
  ...updateSemesterValidator,
  validate,
  update,
);
router.patch("/:id/current", authorize("admin"), validateUUID(), makeCurrent);
router.patch("/:id/deactivate", authorize("admin"), validateUUID(), deactivate);
router.patch("/:id/restore", authorize("admin"), validateUUID(), restore);

export default router;
