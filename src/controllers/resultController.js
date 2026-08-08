import * as resultService from "../services/resultService.js";
import { response } from "../utils/response.js";
import * as resultUploadService from "../services/resultUploadService.js";

export const createResult = async (req, res, next) => {
  try {
    const result = await resultService.createResult(req.body);

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

    return response(res, result, "Result approved successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivateResult = async (req, res, next) => {
  try {
    const result = await resultService.deactivateResult(req.params.id);

    return response(res, result, "Result deactivated successfully");
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

    return response(res, result, "Results uploaded successfully", 201);
  } catch (error) {
    next(error);
  }
};
