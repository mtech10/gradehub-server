import express from "express";
import { healthCheck } from "../controllers/healthController.js";
import authRoutes from "./authRoutes.js";
import departmentRoutes from "./departmentRoutes.js";

const router = express.Router();

// Root Route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to GradeHub API",
    version: "1.0.0",
  });
});

// Health Check
router.get("/health", healthCheck);

router.use("/auth", authRoutes);

router.use("/departments", departmentRoutes);

export default router;
