import express from "express";
import { healthCheck } from "../controllers/healthController.js";
import authRoutes from "./authRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import facultyRoutes from "./facultyRoutes.js";
import sessionRoutes from "./sessionRoutes.js";
import semesterRoutes from "./semesterRoutes.js";
import levelRoutes from "./levelRoutes.js";
import courseRoutes from "./courseRoutes.js";
import studentRoutes from "./studentRoutes.js";
import courseRegistrationRoutes from "./courseRegistrationRoutes.js";
import resultRoutes from "./resultRoutes.js";

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
router.use("/faculties", facultyRoutes);
router.use("/sessions", sessionRoutes);
router.use("/semesters", semesterRoutes);
router.use("/levels", levelRoutes);
router.use("/courses", courseRoutes);
router.use("/students", studentRoutes);
router.use("/course-registrations", courseRegistrationRoutes);
router.use("/results", resultRoutes);

export default router;
