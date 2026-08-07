import express from "express";

import * as dashboardController from "../controllers/dashboardController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);

router.get("/admin", authorize("admin"), dashboardController.getAdminDashboard);

router.get(
  "/student",
  authorize("student"),
  dashboardController.getStudentDashboard,
);

export default router;
