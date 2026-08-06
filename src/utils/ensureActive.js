import pool from "../config/database.js";
import apiError from "./apiError.js";

const ensureActive = async ({ table, id, message }) => {
  const result = await pool.query(
    `
        SELECT id
        FROM ${table}
        WHERE id=$1
        AND isactive=true
        `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, message);
  }

  return true;
};

export default ensureActive;
