import pool from "../config/database.js";
import apiError from "./apiError.js";

const entityExists = async (
  table,
  id,
  message = "Resource not found",
  activeOnly = true,
) => {
  const query = activeOnly
    ? `SELECT id FROM ${table} WHERE id = $1 AND isactive = true`
    : `SELECT id FROM ${table} WHERE id = $1`;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    throw apiError(404, message);
  }

  return true;
};

export default entityExists;
