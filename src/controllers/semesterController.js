import {
  createSemester,
  getSemesters,
  getSemesterById,
  updateSemester,
  setCurrentSemester,
  deactivateSemester,
  restoreSemester,
} from "../services/semesterService.js";

import { response } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const semester = await createSemester(req.body);

    return response(res, semester, "Semester created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { semesters, pagination } = await getSemesters(req.query);

    return response(
      res,
      semesters,
      "Semesters retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const semester = await getSemesterById(req.params.id);

    return response(res, semester, "Semester retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const semester = await updateSemester(req.params.id, req.body);

    return response(res, semester, "Semester updated successfully");
  } catch (error) {
    next(error);
  }
};

export const makeCurrent = async (req, res, next) => {
  try {
    const semester = await setCurrentSemester(req.params.id);

    return response(res, semester, "Current semester updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivate = async (req, res, next) => {
  try {
    const semester = await deactivateSemester(req.params.id);

    return response(res, semester, "Semester deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const restore = async (req, res, next) => {
  try {
    const semester = await restoreSemester(req.params.id);

    return response(res, semester, "Semester restored successfully");
  } catch (error) {
    next(error);
  }
};
