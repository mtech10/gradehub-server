import * as resultService from "../services/resultService.js";
import { response } from "../utils/response.js";
import * as resultUploadService from "../services/resultUploadService.js";
import pool from "../config/database.js";
import {
  createNotification,
  notifyAdmins,
} from "../services/notificationService.js";

export const createResult = async (req, res, next) => {
  try {
    const result = await resultService.createResult(req.body);

    // Notify the student
    if (req.body.studentId) {
      await createNotification({
        studentId: req.body.studentId,
        title: "New Result Uploaded",
        message: "A new academic result has been uploaded to your profile.",
        category: "results",
      });
    }

    return response(res, result, "Result created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const { results, pagination } = await resultService.getResults(req.query);

    return response(
      res,
      results,
      "Results retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getResultStatistics = async (req, res, next) => {
  try {
    const statistics = await resultService.getResultStatistics(req.query);

    return response(
      res,
      statistics,
      "Result statistics retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getMyResults = async (req, res, next) => {
  try {
    const studentId = req.user.studentid;

    if (!studentId) {
      return res.status(404).json({
        success: false,
        message: "Student profile not linked to this account",
        errors: [],
      });
    }

    const { results, pagination } = await resultService.getResults({
      ...req.query,
      studentId,
      approved: "true",
    });

    return response(
      res,
      results,
      "Student results retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getResultById = async (req, res, next) => {
  try {
    const result = await resultService.getResultById(req.params.id);

    return response(res, result, "Result retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateResult = async (req, res, next) => {
  try {
    const result = await resultService.updateResult(req.params.id, req.body);

    return response(res, result, "Result updated successfully");
  } catch (error) {
    next(error);
  }
};

export const approveResult = async (req, res, next) => {
  try {
    const result = await resultService.approveResult(req.params.id);

    // FIX: Intelligently grab the student ID from raw DB row or mapped object
    const targetStudentId =
      result?.studentid ||
      result?.student_id ||
      result?.studentId ||
      result?.student?.id;

    if (targetStudentId) {
      await createNotification({
        studentId: targetStudentId,
        title: "Result Approved",
        message:
          "One of your recent results has been approved and is now visible.",
        category: "results",
      });
    }

    return response(res, result, "Result approved successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivateResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE results SET isapproved = false WHERE id = $1 RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Result not found" });
    }

    // Notify the student
    await createNotification({
      studentId: result.rows[0].studentid,
      title: "Result Suspended",
      message:
        "One of your results has been temporarily suspended pending review.",
      category: "alert",
    });

    res
      .status(200)
      .json({ message: "Result suspended successfully", data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const restoreResult = async (req, res, next) => {
  try {
    const result = await resultService.restoreResult(req.params.id);

    return response(res, result, "Result restored successfully");
  } catch (error) {
    next(error);
  }
};

export const validateUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Result Excel file is required",
        errors: [],
      });
    }

    const { sessionId, semesterId, departmentId, courseId, levelId } = req.body;

    const validation = await resultUploadService.validateResultUpload({
      fileBuffer: req.file.buffer,
      metadata: {
        sessionId,
        semesterId,
        departmentId,
        courseId,
        levelId,
      },
    });

    return response(res, validation, "Result file validated successfully");
  } catch (error) {
    next(error);
  }
};

export const uploadResults = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Result Excel file is required",
        errors: [],
      });
    }

    const {
      sessionId,
      semesterId,
      departmentId,
      courseId,
      levelId,
      uploadType,
    } = req.body;

    const result = await resultUploadService.uploadResults({
      fileBuffer: req.file.buffer,
      metadata: {
        sessionId,
        semesterId,
        departmentId,
        courseId,
        levelId,
      },
      uploadType,
    });

    // Notify all admins that a bulk upload occurred
    await notifyAdmins({
      title: "Bulk Results Uploaded",
      message: `A new batch of results has been uploaded and is pending approval.`,
      category: "system",
    });

    return response(res, result, "Results uploaded successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const bulkApproveResults = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ message: "No result IDs provided" });
    }

    // Capture the student IDs affected by this bulk update
    const updated = await pool.query(
      `UPDATE results SET isapproved = true WHERE id = ANY($1::uuid[]) RETURNING studentid`,
      [ids],
    );

    // Extract unique student IDs to avoid sending 5 notifications if 5 results are approved for one student
    const uniqueStudentIds = [
      ...new Set(updated.rows.map((row) => row.studentid)),
    ];

    // Notify each affected student once
    for (const studentId of uniqueStudentIds) {
      await createNotification({
        studentId,
        title: "Results Approved",
        message:
          "One or more of your results have been approved and are now visible.",
        category: "results",
      });
    }

    res.status(200).json({ message: "Results approved successfully" });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteResults = async (req, res, next) => {
  try {
    const ids = req.body?.ids;

    if (!ids || !ids.length) {
      return res
        .status(400)
        .json({ message: "No result IDs provided for deletion" });
    }

    await pool.query(`DELETE FROM results WHERE id = ANY($1::uuid[])`, [ids]);

    res.status(200).json({ message: "Results deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const bulkDeactivateResults = async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    if (!ids || !ids.length) {
      return res.status(400).json({ message: "No result IDs provided" });
    }

    // Capture the student IDs affected by this bulk update
    const updated = await pool.query(
      `UPDATE results SET isapproved = false WHERE id = ANY($1::uuid[]) RETURNING studentid`,
      [ids],
    );

    // Extract unique student IDs
    const uniqueStudentIds = [
      ...new Set(updated.rows.map((row) => row.studentid)),
    ];

    // Notify each affected student once
    for (const studentId of uniqueStudentIds) {
      await createNotification({
        studentId,
        title: "Results Suspended",
        message:
          "One or more of your results have been temporarily suspended pending review.",
        category: "alert",
      });
    }

    res
      .status(200)
      .json({ message: "Selected results suspended successfully" });
  } catch (error) {
    next(error);
  }
};
