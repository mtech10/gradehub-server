import * as levelService from "../services/levelService.js";
import { response } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const level = await levelService.createLevel(req.body);

    return response(res, level, "Level created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { levels, pagination } = await levelService.getLevels(req.query);

    return response(
      res,
      levels,
      "Levels retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const level = await levelService.getLevelById(req.params.id);

    return response(res, level, "Level retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const level = await levelService.updateLevel(req.params.id, req.body);

    return response(res, level, "Level updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivate = async (req, res, next) => {
  try {
    const level = await levelService.deactivateLevel(req.params.id);

    return response(res, level, "Level deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const restore = async (req, res, next) => {
  try {
    const level = await levelService.restoreLevel(req.params.id);

    return response(res, level, "Level restored successfully");
  } catch (error) {
    next(error);
  }
};
