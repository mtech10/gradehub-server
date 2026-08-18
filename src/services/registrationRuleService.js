import pool from "../config/database.js";
import apiError from "../utils/apiError.js";

export const saveRegistrationRule = async (data) => {
  const { departmentid, levelid, min_units, max_units } = data;

  if (!departmentid || !levelid) {
    throw apiError(400, "Department and Level are required to set a rule.");
  }

  // The ON CONFLICT clause makes this an "Upsert"
  const query = `
    INSERT INTO registration_rules (departmentid, levelid, min_units, max_units)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (departmentid, levelid) 
    DO UPDATE SET 
      min_units = EXCLUDED.min_units,
      max_units = EXCLUDED.max_units,
      updatedat = CURRENT_TIMESTAMP
    RETURNING *
  `;

  const result = await pool.query(query, [
    departmentid,
    levelid,
    min_units || 12, // Default fallback
    max_units || 48, // Default fallback
  ]);

  return result.rows[0];
};

export const getRegistrationRules = async () => {
  const query = `
    SELECT rr.*, d.name as department_name, l.name as level_name
    FROM registration_rules rr
    JOIN departments d ON rr.departmentid = d.id
    JOIN levels l ON rr.levelid = l.id
    ORDER BY d.name ASC, l.name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// We will use this in the next step to validate a student's cart!
export const getRuleForStudent = async (departmentid, levelid) => {
  const query = `
    SELECT min_units, max_units 
    FROM registration_rules 
    WHERE departmentid = $1 AND levelid = $2
  `;
  const result = await pool.query(query, [departmentid, levelid]);

  // Return the specific rule, or fallback to the system default if no rule exists yet
  return result.rows[0] || { min_units: 12, max_units: 48 };
};

export const deleteRegistrationRule = async (id) => {
  const result = await pool.query(
    `DELETE FROM registration_rules WHERE id = $1 RETURNING *`,
    [id],
  );

  if (result.rowCount === 0) {
    throw apiError(404, "Registration rule not found");
  }

  return result.rows[0];
};
