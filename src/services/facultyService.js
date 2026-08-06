import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import { mapFaculty } from "../utils/mappers/facultyMapper.js";
import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createFaculty = async (data) => {
  const { name, code, dean, description } = data;

  const existing = await pool.query(
    `
    SELECT id
    FROM faculties
    WHERE code = $1
       OR name = $2
    `,
    [code, name],
  );

  if (existing.rows.length > 0) {
    throw apiError(409, "Faculty already exists");
  }

  const result = await pool.query(
    `
    INSERT INTO faculties
    (
      name,
      code,
      dean,
      description
    )
    VALUES ($1,$2,$3,$4)
    RETURNING *
    `,
    [name, code, dean, description],
  );

  return mapFaculty(result.rows[0]);
};

export const getFaculties = async () => {
  const result = await pool.query(`
    SELECT *
    FROM faculties
    WHERE isactive = true
    ORDER BY name ASC
  `);

  return result.rows.map(mapFaculty);
};

export const getFacultyById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM faculties
    WHERE id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, "Faculty not found");
  }

  return mapFaculty(result.rows[0]);
};

export const updateFaculty = async (id, data) => {
  const faculty = await getFacultyById(id);

  const updated = {
    ...faculty,
    ...data,
  };

  const result = await pool.query(
    `
    UPDATE faculties
    SET
      name = $1,
      code = $2,
      dean = $3,
      description = $4,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
    `,
    [updated.name, updated.code, updated.dean, updated.description, id],
  );

  return mapFaculty(result.rows[0]);
};

export const deactivateFaculty = async (id) => {
  const faculty = await softDelete("faculties", id, "Faculty not found");

  return mapFaculty(faculty);
};

export const restoreFaculty = async (id) => {
  const faculty = await restoreEntity("faculties", id, "Faculty not found");

  return mapFaculty(faculty);
};
