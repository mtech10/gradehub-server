import express from "express";

import * as levelController from "../controllers/levelController.js";

import validate from "../middleware/validate.js";

import {
  createLevelValidator,
  updateLevelValidator,
} from "../validators/levelValidator.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);

router.get("/", levelController.getAll);

router.get("/:id", levelController.getOne);

router.post(
  "/",
  authorize("admin"),
  createLevelValidator,
  validate,
  levelController.create,
);

router.put(
  "/:id",
  authorize("admin"),
  updateLevelValidator,
  validate,
  levelController.update,
);

router.patch("/:id/deactivate", authorize("admin"), levelController.deactivate);

router.patch("/:id/restore", authorize("admin"), levelController.restore);

export default router;
