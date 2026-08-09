import * as courseService from "../services/courseService.js";
import { response } from "../utils/response.js";

export const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body);

    return response(res, course, "Course created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const { courses, pagination } = await courseService.getCourses(req.query);

    return response(
      res,
      courses,
      "Courses retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);

    return response(res, course, "Course retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);

    return response(res, course, "Course updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivateCourse = async (req, res, next) => {
  try {
    const course = await courseService.deactivateCourse(req.params.id);

    return response(res, course, "Course deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const restoreCourse = async (req, res, next) => {
  try {
    const course = await courseService.restoreCourse(req.params.id);

    return response(res, course, "Course restored successfully");
  } catch (error) {
    next(error);
  }
};

export const getCourseStatistics = async (req, res, next) => {
  try {
    const statistics = await courseService.getCourseStatistics();

    return response(
      res,
      statistics,
      "Course statistics retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};
