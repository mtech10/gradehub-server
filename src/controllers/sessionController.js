import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  setCurrentSession,
  deactivateSession,
  restoreSession,
  runSessionPromotion,
} from "../services/sessionService.js";

import { response } from "../utils/response.js";
import { notifyAdmins } from "../services/notificationService.js";

export const create = async (req, res, next) => {
  try {
    const session = await createSession(req.body);

    await notifyAdmins({
      title: "New Session Created",
      message: `The academic session ${session.name || ""} has been created and added to the system.`,
      category: "system",
    });

    return response(res, session, "Session created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { sessions, pagination } = await getSessions(req.query);
    return response(
      res,
      sessions,
      "Sessions retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const session = await getSessionById(req.params.id);
    return response(res, session, "Session retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const session = await updateSession(req.params.id, req.body);
    return response(res, session, "Session updated successfully");
  } catch (error) {
    next(error);
  }
};

export const makeCurrent = async (req, res, next) => {
  try {
    const session = await setCurrentSession(req.params.id);

    await notifyAdmins({
      title: "Active Session Updated",
      message: `The current academic session has been officially set to ${session.name || "a new session"}.`,
      category: "system",
    });

    return response(res, session, "Current session updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivate = async (req, res, next) => {
  try {
    const session = await deactivateSession(req.params.id);
    return response(res, session, "Session deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const restore = async (req, res, next) => {
  try {
    const session = await restoreSession(req.params.id);
    return response(res, session, "Session restored successfully");
  } catch (error) {
    next(error);
  }
};

export const promote = async (req, res, next) => {
  try {
    const result = await runSessionPromotion(req.params.id);

    const { promoted = 0, graduated = 0 } = result.stats || {};
    await notifyAdmins({
      title: "Session Promotion Completed",
      message: `The promotion process finished successfully. Promoted: ${promoted} | Graduated: ${graduated}.`,
      category: "system",
    });

    return response(res, result.stats, result.message, 200);
  } catch (error) {
    next(error);
  }
};
