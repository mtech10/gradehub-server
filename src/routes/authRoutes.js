import express from "express";
import { registerAdmin, login } from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/login", login);
router.get("/me", authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});
router.get("/admin-only", authenticate, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
  });
});
export default router;
