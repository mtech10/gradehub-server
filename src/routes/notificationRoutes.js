import express from "express";

import * as notificationController from "../controllers/notificationController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validateUUID from "../middleware/validateUUID.js";

import { createNotificationValidator } from "../validators/notificationValidator.js";

const router = express.Router();

router.use(authenticate);

router.get("/recent", notificationController.getRecentNotifications);

router.get("/summary", notificationController.getNotificationSummary);

router.get("/", notificationController.getNotifications);

router.patch("/read-all", notificationController.markAllNotificationsAsRead);

router.patch(
  "/:id/read",
  validateUUID(),
  notificationController.markNotificationAsRead,
);

router.delete(
  "/:id",
  validateUUID(),
  notificationController.deleteNotification,
);

router.post(
  "/",
  authorize("admin"),
  createNotificationValidator,
  validate,
  notificationController.createNotification,
);

export default router;
