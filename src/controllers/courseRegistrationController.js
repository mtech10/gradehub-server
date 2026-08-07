import * as courseRegistrationService from "../services/courseRegistrationService.js";
import { response } from "../utils/response.js";

export const createCourseRegistration = async (req, res, next) => {
  try {
    const courseRegistration =
      await courseRegistrationService.createCourseRegistration(req.body);

    return response(
      res,
      courseRegistration,
      "Course registration created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getCourseRegistrations = async (req, res, next) => {
  try {
    const { courseRegistrations, pagination } =
      await courseRegistrationService.getCourseRegistrations(req.query);

    return response(
      res,
      courseRegistrations,
      "Course registrations retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getCourseRegistrationById = async (req, res, next) => {
  try {
    const courseRegistration =
      await courseRegistrationService.getCourseRegistrationById(req.params.id);

    return response(
      res,
      courseRegistration,
      "Course registration retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const updateCourseRegistration = async (req, res, next) => {
  try {
    const courseRegistration =
      await courseRegistrationService.updateCourseRegistration(
        req.params.id,
        req.body,
      );

    return response(
      res,
      courseRegistration,
      "Course registration updated successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const deactivateCourseRegistration = async (req, res, next) => {
  try {
    const courseRegistration =
      await courseRegistrationService.deactivateCourseRegistration(
        req.params.id,
      );

    return response(
      res,
      courseRegistration,
      "Course registration deactivated successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const restoreCourseRegistration = async (req, res, next) => {
  try {
    const courseRegistration =
      await courseRegistrationService.restoreCourseRegistration(req.params.id);

    return response(
      res,
      courseRegistration,
      "Course registration restored successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentRegistration = async (req, res, next) => {
  try {
    const studentId = req.user.studentid;

    const registrationData =
      await courseRegistrationService.getCurrentStudentRegistrationData(
        studentId,
      );

    return response(
      res,
      registrationData,
      "Current registration data retrieved successfully",
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const submitRegistration = async (req, res, next) => {
  try {
    const studentId = req.user.studentid;
    const { registerCourseCodes, dropCourseCodes } = req.body;

    const result = await courseRegistrationService.processStudentRegistration(
      studentId,
      registerCourseCodes,
      dropCourseCodes,
    );

    return response(res, result, "Registration updated successfully", 200);
  } catch (error) {
    next(error);
  }
};
