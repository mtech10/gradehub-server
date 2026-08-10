import pool from "../config/database.js";

import { buildPagination } from "../utils/pagination.js";

import { mapDepartment } from "../utils/mappers/departmentMapper.js";

import ensureActive from "../utils/ensureActive.js";
import checkDuplicate from "../utils/checkDuplicate.js";

import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

// export const createDepartment = async (data) => {
//   const { name, code, facultyId, hod, description } = data;

//   await checkDuplicate({
//     table: "departments",
//     conditions: {
//       code,
//     },
//     excludeId: id,
//     message: "Department already exists",
//   });

//   await ensureActive({
//     table: "faculties",
//     id: facultyId,
//     message: "Faculty not found",
//   });
//   const result = await pool.query(
//     `
//     INSERT INTO departments
//     (
//       name,
//       code,
//       facultyid,
//       hod,
//       description
//     )
//     VALUES ($1,$2,$3,$4,$5)
//     RETURNING id
//     `,
//     [name, code, facultyId, hod, description],
//   );

//   return getDepartmentById(result.rows[0].id);
// };

export const createDepartment = async (data) => {
  const { name, code, facultyId, hod, description } = data;

  // Check for duplicate code without excludeId
  await checkDuplicate({
    table: "departments",
    conditions: {
      code,
    },
    message: "Department already exists",
  });

  await ensureActive({
    table: "faculties",
    id: facultyId,
    message: "Faculty not found",
  });

  const result = await pool.query(
    `
    INSERT INTO departments
    (
      name,
      code,
      facultyid,
      hod,
      description
    )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id
    `,
    [name, code, facultyId, hod, description],
  );

  return getDepartmentById(result.rows[0].id);
};

export const getDepartments = async (filters) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "active",
    sort = "name",
    order = "asc",
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "";
  const values = [];
  let index = 1;

  if (status === "active") {
    whereClause += ` WHERE d.isactive = true`;
  } else if (status === "inactive") {
    whereClause += ` WHERE d.isactive = false`;
  }

  if (search) {
    const searchClause = `
      (
        d.name ILIKE $${index}
        OR d.code ILIKE $${index}
        OR d.hod ILIKE $${index}
        OR f.name ILIKE $${index}
      )
    `;

    values.push(`%${search}%`);

    whereClause += whereClause
      ? ` AND ${searchClause}`
      : ` WHERE ${searchClause}`;

    index++;
  }

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM departments d
    JOIN faculties f
      ON d.facultyid = f.id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);

  const total = Number(countResult.rows[0].total);

  const allowedSortFields = ["name", "code", "createdat", "updatedat"];

  const sortBy = allowedSortFields.includes(sort) ? sort : "name";

  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  values.push(limit);
  values.push(offset);

  const query = `
    SELECT
      d.id,
      d.name,
      d.code,
      d.hod,
      d.description,
      d.isactive,
      d.createdat,
      d.updatedat,

      f.id   AS faculty_id,
      f.name AS faculty_name,
      f.code AS faculty_code

    FROM departments d

    JOIN faculties f
      ON d.facultyid = f.id

    ${whereClause}

    ORDER BY d.${sortBy} ${sortOrder}

    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const result = await pool.query(query, values);

  return {
    departments: result.rows.map(mapDepartment),
    pagination: buildPagination(page, limit, total),
  };
};

export const getDepartmentById = async (id) => {
  const exists = await pool.query(
    `
    SELECT id
    FROM departments
    WHERE id = $1
  `,
    [id],
  );

  if (exists.rows.length === 0) {
    throw apiError(404, "Department not found");
  }

  const result = await pool.query(
    `
    SELECT
      d.id,
      d.name,
      d.code,
      d.hod,
      d.description,
      d.isactive,
      d.createdat,
      d.updatedat,

      f.id   AS faculty_id,
      f.name AS faculty_name,
      f.code AS faculty_code

    FROM departments d

    JOIN faculties f
      ON d.facultyid = f.id

    WHERE d.id = $1
    `,
    [id],
  );

  return mapDepartment(result.rows[0]);
};

export const updateDepartment = async (id, data) => {
  const { name, code, facultyId, hod, description } = data;

  await ensureActive({
    table: "departments",
    id,
    message: "Department not found",
  });
  await ensureActive({
    table: "faculties",
    id: facultyId,
    message: "Faculty not found",
  });
  await checkDuplicate({
    table: "departments",
    conditions: {
      code,
    },
    excludeId: id,
    message: "Department already exists",
  });

  await pool.query(
    `
    UPDATE departments
    SET
      name = $1,
      code = $2,
      facultyid = $3,
      hod = $4,
      description = $5,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $6
    `,
    [name, code, facultyId, hod, description, id],
  );

  return getDepartmentById(id);
};

export const deactivateDepartment = async (id) => {
  await softDelete("departments", id, "Department not found");

  return getDepartmentById(id);
};

export const restoreDepartment = async (id) => {
  await restoreEntity("departments", id, "Department not found");

  return getDepartmentById(id);
};

export const getDepartmentStats = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM departments) AS total_departments,
      (SELECT COUNT(*) FROM departments WHERE isactive = true) AS active_departments,
      (SELECT COUNT(*) FROM students WHERE isactive = true) AS total_students,
      (SELECT COUNT(*) FROM courses WHERE isactive = true) AS total_courses
  `);

  return result.rows[0];
};
