import pool from "../config/database.js";

import checkDuplicate from "../utils/checkDuplicate.js";
import apiError from "../utils/apiError.js";

import { mapFaculty } from "../utils/mappers/facultyMapper.js";

import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createFaculty = async (data) => {
  const { name, code, dean, description } = data;

  await checkDuplicate({
    table: "faculties",
    conditions: {
      code,
    },
    message: "Faculty already exists",
  });

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
  const exists = await pool.query(
    `
    SELECT id
    FROM faculties
    WHERE id = $1
  `,
    [id],
  );

  if (exists.rows.length === 0) {
    throw apiError(404, "Faculty not found");
  }
  const result = await pool.query(
    `
    SELECT *
    FROM faculties
    WHERE id = $1
    `,
    [id],
  );

  return mapFaculty(result.rows[0]);
};

export const updateFaculty = async (id, data) => {
  const exists = await pool.query(
    `
    SELECT id
    FROM faculties
    WHERE id = $1
  `,
    [id],
  );

  if (exists.rows.length === 0) {
    throw apiError(404, "Faculty not found");
  }
  const { name, code, dean, description } = data;

  if (code) {
    await checkDuplicate({
      table: "faculties",
      conditions: {
        code,
      },
      excludeId: id,
      message: "Faculty already exists",
    });
  }

  if (name) {
    await checkDuplicate({
      table: "faculties",
      conditions: {
        name,
      },
      excludeId: id,
      message: "Faculty name already exists",
    });
  }

  const current = await getFacultyById(id);

  const updated = {
    ...current,
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
