import express from "express";
import {
  savePromotionRule,
  getPromotionRules,
  deletePromotionRule,
  deletePromotionRulesBatch,
} from "../services/sessionService.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// Middleware for auth
router.use(authenticate, authorize("admin"));

// 1. GET ALL RULES
router.get("/", async (req, res, next) => {
  try {
    const rules = await getPromotionRules();
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
});

// 2. SAVE NEW RULE
router.post("/", async (req, res, next) => {
  try {
    const rule = await savePromotionRule(req.body);
    res.status(200).json({
      success: true,
      message: "Promotion rule saved successfully",
      data: rule,
    });
  } catch (error) {
    next(error);
  }
});

// 3. BATCH DELETE
router.post("/batch-delete", async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    }
    await deletePromotionRulesBatch(ids);
    res
      .status(200)
      .json({ success: true, message: "Rules deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE SINGLE RULE
router.delete("/:id", async (req, res, next) => {
  try {
    await deletePromotionRule(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Promotion rule deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
