import express from "express";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";

import {
  createSessionSchema,
  updateSessionSchema,
} from "../validators/sessionValidator.js";

import {
  create,
  getAll,
  getOne,
  update,
  makeCurrent,
  deactivate,
  restore,
} from "../controllers/sessionController.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getAll);

router.get("/:id", getOne);

router.post("/", validate(createSessionSchema), create);

router.put("/:id", validate(updateSessionSchema), update);

router.patch("/:id/current", makeCurrent);

router.patch("/:id/deactivate", deactivate);

router.patch("/:id/restore", restore);

export default router;
