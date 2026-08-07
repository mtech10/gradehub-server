import * as notificationService from "../services/notificationService.js";

export const getRecentNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getRecentNotifications(
      req.user.id,
    );

    res.json({
      success: true,
      message: "Recent notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, category, unread } = req.query;

    const notifications = await notificationService.getNotifications(
      req.user.id,
      {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        category,
        unread: unread === "true",
      },
    );

    res.json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationSummary = async (req, res, next) => {
  try {
    const summary = await notificationService.getNotificationSummary(
      req.user.id,
    );

    res.json({
      success: true,
      message: "Notification summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markNotificationAsRead(
      req.params.id,
      req.user.id,
    );

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllNotificationsAsRead(
      req.user.id,
    );

    res.json({
      success: true,
      message: result.message,
      data: {
        updated: result.updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.deleteNotification(
      req.params.id,
      req.user.id,
    );

    res.json({
      success: true,
      message: "Notification deleted successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
