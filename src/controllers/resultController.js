import * as resultService from "../services/resultService.js";
import { response } from "../utils/response.js";

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
