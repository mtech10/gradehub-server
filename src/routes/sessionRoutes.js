import express from "express";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import {
  createSessionValidator,
  updateSessionValidator,
} from "../validators/sessionValidator.js";

import {
  create,
  getAll,
  getOne,
  update,
  makeCurrent,
  deactivate,
  restore,
  promote,
} from "../controllers/sessionController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAll);
router.get("/:id", validateUUID(), getOne);

router.post(
  "/",
  authorize("admin"),
  ...createSessionValidator,
  validate,
  create,
);
router.put(
  "/:id",
  authorize("admin"),
  validateUUID(),
  ...updateSessionValidator,
  validate,
  update,
);
router.patch("/:id/current", authorize("admin"), validateUUID(), makeCurrent);
router.patch("/:id/deactivate", authorize("admin"), validateUUID(), deactivate);
router.patch("/:id/restore", authorize("admin"), validateUUID(), restore);

router.post("/:id/promote", authorize("admin"), validateUUID(), promote);

export default router;
