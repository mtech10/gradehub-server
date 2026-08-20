import pool from "../config/database.js";
import { response } from "../utils/response.js";

export const getDepartments = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM departments WHERE isactive = true ORDER BY name ASC",
    );
    return response(
      res,
      result.rows,
      "Departments retrieved successfully",
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const getLevels = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM levels WHERE isactive = true ORDER BY name ASC",
    );
    return response(res, result.rows, "Levels retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM sessions WHERE isactive = true ORDER BY name DESC",
    );
    return response(res, result.rows, "Sessions retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};
