import express from "express";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";

import {
  createSemesterSchema,
  updateSemesterSchema,
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

router.get("/:id", getOne);

router.post("/", validate(createSemesterSchema), create);

router.put("/:id", validate(updateSemesterSchema), update);

router.patch("/:id/current", makeCurrent);

router.patch("/:id/deactivate", deactivate);

router.patch("/:id/restore", restore);

export default router;
