import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import mapNotification from "../utils/mappers/notificationMapper.js";

export const getRecentNotifications = async (userId) => {
  const result = await pool.query(
    `
    SELECT id, title, message, category, isread, createdat
    FROM notifications
    WHERE userid = $1
    ORDER BY createdat DESC
    LIMIT 5
    `,
    [userId],
  );

  return result.rows.map(mapNotification);
};

export const getNotifications = async (
  userId,
  { page = 1, limit = 10, category, unread },
) => {
  const offset = (page - 1) * limit;
  const values = [userId];
  const conditions = ["userid = $1"];

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (unread === true) {
    conditions.push("isread = false");
  }

  const whereClause = conditions.join(" AND ");

  const notificationsQuery = `
    SELECT id, title, message, category, isread, createdat
    FROM notifications
    WHERE ${whereClause}
    ORDER BY createdat DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit);
  values.push(offset);

  const notifications = await pool.query(notificationsQuery, values);
  const countValues = values.slice(0, values.length - 2);

  const totalResult = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM notifications
    WHERE ${whereClause}
    `,
    countValues,
  );

  return {
    notifications: notifications.rows.map(mapNotification),
    pagination: {
      page,
      limit,
      total: totalResult.rows[0].total,
      hasMore: page * limit < totalResult.rows[0].total,
    },
  };
};

export const getNotificationSummary = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE isread = false)::int AS unread,
      COUNT(*) FILTER (WHERE createdat >= CURRENT_DATE - INTERVAL '7 days')::int AS this_week,
      COUNT(*) FILTER (WHERE DATE_TRUNC('month', createdat) = DATE_TRUNC('month', CURRENT_DATE))::int AS this_month
    FROM notifications
    WHERE userid = $1
    `,
    [userId],
  );

  const summary = result.rows[0];

  return {
    total: Number(summary.total),
    unread: Number(summary.unread),
    thisWeek: Number(summary.this_week),
    thisMonth: Number(summary.this_month),
  };
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET isread = true
    WHERE id = $1 AND userid = $2
    RETURNING id, title, message, category, isread, createdat
    `,
    [notificationId, userId],
  );

  if (!result.rows.length) {
    throw apiError(404, "Notification not found");
  }

  return mapNotification(result.rows[0]);
};

export const markAllNotificationsAsRead = async (userId) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET isread = true
    WHERE userid = $1 AND isread = false
    RETURNING id
    `,
    [userId],
  );

  return {
    message: "All notifications marked as read",
    updated: result.rowCount,
  };
};

export const deleteNotification = async (notificationId, userId) => {
  const result = await pool.query(
    `
    DELETE FROM notifications
    WHERE id = $1 AND userid = $2
    RETURNING id, title, message, category, isread, createdat
    `,
    [notificationId, userId],
  );

  if (!result.rows.length) {
    throw apiError(404, "Notification not found");
  }

  return mapNotification(result.rows[0]);
};

// --- UPDATED: Universal Create Notification ---
export const createNotification = async ({
  userId, // For direct user notification (e.g., Admins)
  studentId, // For looking up a student's user account
  title,
  message,
  category,
}) => {
  let targetUserId = userId;

  // Resolve studentId to userId if userId wasn't directly provided
  if (!targetUserId && studentId) {
    const userResult = await pool.query(
      `SELECT id FROM users WHERE studentid = $1 AND isactive = true`,
      [studentId],
    );

    if (userResult.rows.length > 0) {
      targetUserId = userResult.rows[0].id;
    } else {
      console.warn(
        `Failed to generate notification: Student user account not found for studentId ${studentId}`,
      );
      return null; // Return null safely instead of crashing the main process
    }
  }

  if (!targetUserId) {
    console.warn(
      "Failed to generate notification: No valid userId or studentId provided",
    );
    return null;
  }

  const result = await pool.query(
    `
    INSERT INTO notifications (userid, title, message, category)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, message, category, isread, createdat
    `,
    [targetUserId, title, message, category],
  );

  return mapNotification(result.rows[0]);
};

// --- NEW: Helper to notify all admins simultaneously ---
export const notifyAdmins = async ({ title, message, category }) => {
  try {
    // Find all active admins
    const admins = await pool.query(
      `SELECT id FROM users WHERE role = 'admin' AND isactive = true`,
    );

    // Create a notification for each admin concurrently
    const promises = admins.rows.map((admin) =>
      createNotification({
        userId: admin.id,
        title,
        message,
        category,
      }),
    );

    return await Promise.all(promises);
  } catch (error) {
    console.error("Failed to broadcast admin notifications:", error);
  }
};
