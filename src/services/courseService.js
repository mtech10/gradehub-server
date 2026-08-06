import pool from "../config/database.js";

import apiError from "../utils/apiError.js";

import { buildPagination } from "../utils/pagination.js";

import mapCourse from "../utils/mappers/courseMapper.js";

import checkDuplicate from "../utils/checkDuplicate.js";
import ensureActive from "../utils/ensureActive.js";

import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createCourse = async (data) => {
  const {
    code,
    title,
    creditUnit,
    departmentId,
    levelId,
    semesterId,
    description,
  } = data;

  await ensureActive({
    table: "departments",
    id: departmentId,
    message: "Department not found",
  });

  await ensureActive({
    table: "levels",
    id: levelId,
    message: "Level not found",
  });

  await ensureActive({
    table: "semesters",
    id: semesterId,
    message: "Semester not found",
  });
  await checkDuplicate({
    table: "courses",
    conditions: {
      code,
      departmentid: departmentId,
    },
    excludeId: id,
    message: "Course already exists",
  });

  const result = await pool.query(
    `
    INSERT INTO courses
    (
      departmentid,
      levelid,
      semesterid,
      code,
      title,
      creditunit,
      description
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id
    `,
    [departmentId, levelId, semesterId, code, title, creditUnit, description],
  );

  return await getCourseById(result.rows[0].id);
};

export const getCourses = async (filters) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    departmentId,
    levelId,
    semesterId,
    status = "active",
    sort = "title",
    order = "asc",
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "";
  const values = [];
  let index = 1;

  if (status === "active") {
    whereClause += ` WHERE c.isactive = true`;
  } else if (status === "inactive") {
    whereClause += ` WHERE c.isactive = false`;
  }

  if (departmentId) {
    whereClause += whereClause
      ? ` AND c.departmentid = $${index}`
      : ` WHERE c.departmentid = $${index}`;

    values.push(departmentId);
    index++;
  }

  if (levelId) {
    whereClause += whereClause
      ? ` AND c.levelid = $${index}`
      : ` WHERE c.levelid = $${index}`;

    values.push(levelId);
    index++;
  }

  if (semesterId) {
    whereClause += whereClause
      ? ` AND c.semesterid = $${index}`
      : ` WHERE c.semesterid = $${index}`;

    values.push(semesterId);
    index++;
  }

  if (search) {
    const clause = `
      (
        c.title ILIKE $${index}
        OR c.code ILIKE $${index}
      )
    `;

    whereClause += whereClause ? ` AND ${clause}` : ` WHERE ${clause}`;

    values.push(`%${search}%`);
    index++;
  }

  const countResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM courses c
    ${whereClause}
    `,
    values,
  );

  const total = Number(countResult.rows[0].total);

  const allowedSort = ["title", "code", "creditunit", "createdat", "updatedat"];

  const sortBy = allowedSort.includes(sort) ? sort : "title";

  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  values.push(limit);
  values.push(offset);

  const result = await pool.query(
    `
    SELECT

      c.*,

      d.id   AS department_id,
      d.name AS department_name,
      d.code AS department_code,

      l.id   AS level_id,
      l.name AS level_name,

      s.id   AS semester_id,
      s.name AS semester_name

    FROM courses c

    JOIN departments d
      ON c.departmentid = d.id

    JOIN levels l
      ON c.levelid = l.id

    JOIN semesters s
      ON c.semesterid = s.id

    ${whereClause}

    ORDER BY c.${sortBy} ${sortOrder}

    LIMIT $${index}
    OFFSET $${index + 1}
    `,
    values,
  );

  return {
    courses: result.rows.map(mapCourse),
    pagination: buildPagination(page, limit, total),
  };
};

export const getCourseById = async (id) => {
  const result = await pool.query(
    `
    SELECT

      c.*,

      d.id   AS department_id,
      d.name AS department_name,
      d.code AS department_code,

      l.id   AS level_id,
      l.name AS level_name,

      s.id   AS semester_id,
      s.name AS semester_name

    FROM courses c

    JOIN departments d
      ON c.departmentid = d.id

    JOIN levels l
      ON c.levelid = l.id

    JOIN semesters s
      ON c.semesterid = s.id

    WHERE c.id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, "Course not found");
  }

  return mapCourse(result.rows[0]);
};

export const updateCourse = async (id, data) => {
  await ensureActive({
    table: "courses",
    id,
    message: "Course not found",
  });

  const {
    code,
    title,
    creditUnit,
    departmentId,
    levelId,
    semesterId,
    description,
  } = data;

  await ensureActive({
    table: "departments",
    id: departmentId,
    message: "Department not found",
  });

  await ensureActive({
    table: "levels",
    id: levelId,
    message: "Level not found",
  });

  await ensureActive({
    table: "semesters",
    id: semesterId,
    message: "Semester not found",
  });

  await checkDuplicate({
    table: "courses",
    conditions: {
      code,
      departmentid: departmentId,
    },
    excludeId: id,
    message: "Course already exists",
  });

  await pool.query(
    `
    UPDATE courses
    SET
      departmentid = $1,
      levelid = $2,
      semesterid = $3,
      code = $4,
      title = $5,
      creditunit = $6,
      description = $7,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $8
    `,
    [
      departmentId,
      levelId,
      semesterId,
      code,
      title,
      creditUnit,
      description,
      id,
    ],
  );

  return await getCourseById(id);
};

export const deactivateCourse = async (id) => {
  await softDelete("courses", id, "Course not found");

  return await getCourseById(id);
};

export const restoreCourse = async (id) => {
  await restoreEntity("courses", id, "Course not found");

  return await getCourseById(id);
};
