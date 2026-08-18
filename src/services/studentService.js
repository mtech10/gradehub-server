import pool from "../config/database.js";

import { buildPagination } from "../utils/pagination.js";
import mapStudent from "../utils/mappers/studentMapper.js";
import checkDuplicate from "../utils/checkDuplicate.js";
import ensureActive from "../utils/ensureActive.js";
import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createStudent = async (data) => {
  const {
    matricNumber,
    firstName,
    middleName,
    lastName,
    gender,
    email,
    phone,
    dateOfBirth,
    admissionYear,
    departmentId,
    levelId,
    sessionId,
    photo,
  } = data;

  await checkDuplicate({
    table: "students",
    conditions: { matricnumber: matricNumber },
    message: "Matric number already exists",
  });

  if (email) {
    await checkDuplicate({
      table: "students",
      conditions: { email },
      message: "Email already exists",
    });
  }

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
    table: "sessions",
    id: sessionId,
    message: "Session not found",
  });

  const result = await pool.query(
    `
    INSERT INTO students
    (
      matricnumber, firstname, middlename, lastname, gender, 
      email, phone, dateofbirth, admissionyear, departmentid, 
      levelid, sessionid, photo
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
    )
    RETURNING id
    `,
    [
      matricNumber,
      firstName,
      middleName,
      lastName,
      gender,
      email,
      phone,
      dateOfBirth,
      admissionYear,
      departmentId,
      levelId,
      sessionId,
      photo,
    ],
  );

  return await getStudentById(result.rows[0].id);
};
export const getStudents = async (filters) => {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 10;

  const {
    search = "",
    status, // Do NOT default to "active" here so "All" works
    departmentId,
    levelId,
    sessionId,
    sort = "lastname",
    order = "asc",
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "";
  const values = [];
  let index = 1;

  // Handle status filter dynamically
  if (status && status.toLowerCase() !== "all") {
    const s = status.toLowerCase();
    if (s === "active") {
      whereClause += ` WHERE s.isactive = true`;
    } else if (s === "inactive" || s === "suspended" || s === "withdrawn") {
      whereClause += ` WHERE s.isactive = false`;
    }
  }

  if (departmentId) {
    whereClause += whereClause
      ? ` AND s.departmentid = $${index}`
      : ` WHERE s.departmentid = $${index}`;
    values.push(departmentId);
    index++;
  }

  if (levelId) {
    whereClause += whereClause
      ? ` AND s.levelid = $${index}`
      : ` WHERE s.levelid = $${index}`;
    values.push(levelId);
    index++;
  }

  if (sessionId) {
    whereClause += whereClause
      ? ` AND s.sessionid = $${index}`
      : ` WHERE s.sessionid = $${index}`;
    values.push(sessionId);
    index++;
  }

  if (search) {
    const searchClause = `(s.firstname ILIKE $${index} OR s.lastname ILIKE $${index} OR s.matricnumber ILIKE $${index} OR s.email ILIKE $${index})`;
    values.push(`%${search}%`);
    whereClause += whereClause
      ? ` AND ${searchClause}`
      : ` WHERE ${searchClause}`;
    index++;
  }

  const countQuery = `SELECT COUNT(*) AS total FROM students s ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].total);

  const allowedSort = ["firstname", "lastname", "matricnumber", "createdat"];
  const sortBy = allowedSort.includes(sort) ? sort : "lastname";
  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  values.push(limit);
  values.push(offset);

  const result = await pool.query(
    `SELECT s.*, d.id AS department_id, d.name AS department_name, d.code AS department_code,
      l.id AS level_id, l.name AS level_name, ses.id AS session_id, ses.name AS session_name
    FROM students s
    JOIN departments d ON s.departmentid = d.id
    JOIN levels l ON s.levelid = l.id
    JOIN sessions ses ON s.sessionid = ses.id
    ${whereClause}
    ORDER BY s.${sortBy} ${sortOrder}
    LIMIT $${index} OFFSET $${index + 1}`,
    values,
  );

  return {
    students: result.rows.map(mapStudent),
    pagination: buildPagination(page, limit, total),
  };
};

export const getStudentById = async (id) => {
  await ensureActive({
    table: "students",
    id,
    message: "Student not found",
  });

  const result = await pool.query(
    `
    SELECT
      s.*,

      d.id   AS department_id,
      d.name AS department_name,
      d.code AS department_code,

      l.id   AS level_id,
      l.name AS level_name,

      ses.id   AS session_id,
      ses.name AS session_name

    FROM students s
    JOIN departments d ON s.departmentid = d.id
    JOIN levels l ON s.levelid = l.id
    JOIN sessions ses ON s.sessionid = ses.id
    WHERE s.id = $1
    `,
    [id],
  );

  return mapStudent(result.rows[0]);
};

export const updateStudent = async (id, data) => {
  await ensureActive({
    table: "students",
    id,
    message: "Student not found",
  });

  const current = await getStudentById(id);
  const updated = {
    ...current,
    ...data,
  };

  await checkDuplicate({
    table: "students",
    conditions: {
      matricnumber: updated.matricNumber,
    },
    excludeId: id,
    message: "Matric number already exists",
  });

  if (updated.email) {
    await checkDuplicate({
      table: "students",
      conditions: {
        email: updated.email,
      },
      excludeId: id,
      message: "Email already exists",
    });
  }

  // FIXED: Fallback to the new IDs if provided in the update payload, otherwise keep the old mapped ID
  const updateDepartmentId = updated.departmentId || updated.department?.id;
  const updateLevelId = updated.levelId || updated.level?.id;
  const updateSessionId = updated.sessionId || updated.session?.id;

  await ensureActive({
    table: "departments",
    id: updateDepartmentId,
    message: "Department not found",
  });

  await ensureActive({
    table: "levels",
    id: updateLevelId,
    message: "Level not found",
  });

  await ensureActive({
    table: "sessions",
    id: updateSessionId,
    message: "Session not found",
  });

  await pool.query(
    `
    UPDATE students
    SET
      matricnumber = $1,
      firstname = $2,
      middlename = $3,
      lastname = $4,
      gender = $5,
      email = $6,
      phone = $7,
      dateofbirth = $8,
      admissionyear = $9,
      departmentid = $10,
      levelid = $11,
      sessionid = $12,
      photo = $13,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $14
    `,
    [
      updated.matricNumber,
      updated.firstName,
      updated.middleName,
      updated.lastName,
      updated.gender,
      updated.email,
      updated.phone,
      updated.dateOfBirth,
      updated.admissionYear,
      updateDepartmentId, // FIXED
      updateLevelId, // FIXED
      updateSessionId, // FIXED
      updated.photo,
      id,
    ],
  );

  return await getStudentById(id);
};

export const deactivateStudent = async (id) => {
  const student = await softDelete("students", id, "Student not found");
  return mapStudent(student);
};

export const restoreStudent = async (id) => {
  const student = await restoreEntity("students", id, "Student not found");
  return mapStudent(student);
};

export const getStudentStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS total_students,
      COUNT(*) FILTER (WHERE isactive = true) AS active_students,
      COUNT(*) FILTER (WHERE isactive = false) AS inactive_students,
      COUNT(DISTINCT departmentid) AS total_departments
    FROM students;
  `;

  const result = await pool.query(query);
  return result.rows[0];
};
