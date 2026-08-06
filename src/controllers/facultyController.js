import * as facultyService from "../services/facultyService.js";
import { response } from "../utils/response.js";

export const createFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.createFaculty(req.body);

    return response(res, faculty, "Faculty created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getFaculties = async (req, res, next) => {
  try {
    const faculties = await facultyService.getFaculties();

    return response(res, faculties, "Faculties retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await facultyService.getFacultyById(req.params.id);

    return response(res, faculty, "Faculty retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.updateFaculty(req.params.id, req.body);

    return response(res, faculty, "Faculty updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivateFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.deactivateFaculty(req.params.id);

    return response(res, faculty, "Faculty deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const restoreFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.restoreFaculty(req.params.id);

    return response(res, faculty, "Faculty restored successfully");
  } catch (error) {
    next(error);
  }
};
