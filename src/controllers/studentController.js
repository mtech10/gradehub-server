import * as studentService from "../services/studentService.js";
import { response } from "../utils/response.js";

export const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);

    return response(res, student, "Student created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const { students, pagination } = await studentService.getStudents(
      req.query,
    );

    return response(
      res,
      students,
      "Students retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);

    return response(res, student, "Student retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);

    return response(res, student, "Student updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivateStudent = async (req, res, next) => {
  try {
    const student = await studentService.deactivateStudent(req.params.id);

    return response(res, student, "Student deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const restoreStudent = async (req, res, next) => {
  try {
    const student = await studentService.restoreStudent(req.params.id);

    return response(res, student, "Student restored successfully");
  } catch (error) {
    next(error);
  }
};
