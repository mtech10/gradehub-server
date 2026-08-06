import pool from "../config/database.js";
import apiError from "./apiError.js";

const restoreEntity = async (table, id, message = "Resource not found") => {
  const result = await pool.query(
    `
    UPDATE ${table}

    SET
      isactive = true,
      updatedat = CURRENT_TIMESTAMP

    WHERE id = $1

    RETURNING *
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, message);
  }

  return result.rows[0];
};

export default restoreEntity;
