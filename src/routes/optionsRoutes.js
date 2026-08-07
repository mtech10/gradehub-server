import express from "express";
import * as optionsController from "../controllers/optionsController.js";

const router = express.Router();

router.get("/departments", optionsController.getDepartments);
router.get("/levels", optionsController.getLevels);
router.get("/sessions", optionsController.getSessions);

export default router;
