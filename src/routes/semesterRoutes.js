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
router.use(authorize("admin"));

router.get("/", getAll);

router.get("/:id", validateUUID(), getOne);

router.post("/", ...createSemesterValidator, validate, create);

router.put(
  "/:id",
  validateUUID(),
  ...updateSemesterValidator,
  validate,
  update,
);

router.patch("/:id/current", validateUUID(), makeCurrent);

router.patch("/:id/deactivate", validateUUID(), deactivate);

router.patch("/:id/restore", validateUUID(), restore);

export default router;
