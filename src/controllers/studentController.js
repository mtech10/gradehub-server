import * as studentService from "../services/studentService.js";
import { response } from "../utils/response.js";
import pool from "../config/database.js";

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
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, d.name AS department_name, l.name AS level_name 
       FROM students s 
       LEFT JOIN departments d ON s.departmentid = d.id 
       LEFT JOIN levels l ON s.levelid = l.id 
       WHERE s.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error); // This prevents hanging if the database crashes
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

// Add this to your backend studentController.js
export const getStudentStats = async (req, res, next) => {
  try {
    const stats = await studentService.getStudentStats();
    return response(
      res,
      stats,
      "Student statistics retrieved successfully",
      200,
    );
  } catch (error) {
    next(error);
  }
};
