import * as courseRegistrationService from "../services/courseRegistrationService.js";
import { response } from "../utils/response.js";
import {
  createNotification,
  notifyAdmins,
} from "../services/notificationService.js";

export const createCourseRegistration = async (req, res, next) => {
  try {
    const courseRegistration =
      await courseRegistrationService.createCourseRegistration(req.body);

    // Notify the student that they were registered for a course (e.g. by an admin)
    if (req.body.studentId) {
      await createNotification({
        studentId: req.body.studentId,
        title: "Course Registration Added",
        message: "A new course has been added to your academic registration.",
        category: "academic",
      });
    }

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

    // Notify the student about the deactivation
    // (Check both camelCase and snake_case depending on how your mapper returns the ID)
    const targetStudentId =
      courseRegistration?.studentid || courseRegistration?.student_id;
    if (targetStudentId) {
      await createNotification({
        studentId: targetStudentId,
        title: "Course Registration Suspended",
        message:
          "One of your course registrations has been suspended or deactivated.",
        category: "alert",
      });
    }

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

export const submitCourseRegistration = async (req, res, next) => {
  try {
    const { registerCourseCodes = [], dropCourseCodes = [] } = req.body;

    const studentId = req.user.studentid;

    const result = await courseRegistrationService.processStudentRegistration({
      studentId,
      registerCourseCodes,
      dropCourseCodes,
    });

    // Notify the student of their successful submission
    await createNotification({
      studentId,
      title: "Course Registration Submitted",
      message: `You have successfully submitted your course registration updates.`,
      category: "academic",
    });

    // Notify all admins that a student updated/submitted their courses
    await notifyAdmins({
      title: "New Course Registration",
      message: "A student has submitted a new course registration.",
      category: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Course registration submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
