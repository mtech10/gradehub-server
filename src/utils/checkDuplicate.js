import pool from "../config/database.js";
import apiError from "./apiError.js";

const checkDuplicate = async ({
  table,
  conditions,
  excludeId = null,
  message,
}) => {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);

  let query = `
    SELECT id
    FROM ${table}
    WHERE
      ${keys.map((key, index) => `${key} = $${index + 1}`).join(" AND ")}
  `;

  if (excludeId) {
    query += ` AND id <> $${values.length + 1}`;
    values.push(excludeId);
  }

  const result = await pool.query(query, values);

  if (result.rows.length > 0) {
    throw apiError(409, message);
  }
};

export default checkDuplicate;
