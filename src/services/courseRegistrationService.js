import pool from "../config/database.js";

import { buildPagination } from "../utils/pagination.js";
import mapCourseRegistration from "../utils/mappers/courseRegistrationMapper.js";

import checkDuplicate from "../utils/checkDuplicate.js";
import entityExists from "../utils/entityExists.js";
import ensureActive from "../utils/ensureActive.js";

import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createCourseRegistration = async (data) => {
  const { studentId, courseId, sessionId, semesterId } = data;

  await ensureActive({
    table: "students",
    id: studentId,
    message: "Student not found",
  });

  await ensureActive({
    table: "courses",
    id: courseId,
    message: "Course not found",
  });

  await ensureActive({
    table: "sessions",
    id: sessionId,
    message: "Session not found",
  });

  await ensureActive({
    table: "semesters",
    id: semesterId,
    message: "Semester not found",
  });

  await checkDuplicate({
    table: "course_registrations",
    conditions: {
      studentid: studentId,
      courseid: courseId,
      sessionid: sessionId,
      semesterid: semesterId,
    },
    message:
      "Student has already registered this course for the selected session and semester",
  });

  const result = await pool.query(
    `
    INSERT INTO course_registrations
    (
      studentid,
      courseid,
      sessionid,
      semesterid
    )
    VALUES ($1,$2,$3,$4)
    RETURNING id
    `,
    [studentId, courseId, sessionId, semesterId],
  );

  return await getCourseRegistrationById(result.rows[0].id);
};

export const getCourseRegistrations = async (filters) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "active",
    studentId,
    courseId,
    sessionId,
    semesterId,
    sort = "registeredat",
    order = "desc",
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "";
  const values = [];
  let index = 1;

  if (status === "active") {
    whereClause += " WHERE cr.isactive = true";
  } else if (status === "inactive") {
    whereClause += " WHERE cr.isactive = false";
  }

  if (studentId) {
    whereClause += whereClause
      ? ` AND cr.studentid = $${index}`
      : ` WHERE cr.studentid = $${index}`;

    values.push(studentId);
    index++;
  }

  if (courseId) {
    whereClause += whereClause
      ? ` AND cr.courseid = $${index}`
      : ` WHERE cr.courseid = $${index}`;

    values.push(courseId);
    index++;
  }

  if (sessionId) {
    whereClause += whereClause
      ? ` AND cr.sessionid = $${index}`
      : ` WHERE cr.sessionid = $${index}`;

    values.push(sessionId);
    index++;
  }

  if (semesterId) {
    whereClause += whereClause
      ? ` AND cr.semesterid = $${index}`
      : ` WHERE cr.semesterid = $${index}`;

    values.push(semesterId);
    index++;
  }

  if (search) {
    const searchClause = `
      (
        s.firstname ILIKE $${index}
        OR s.lastname ILIKE $${index}
        OR s.matricnumber ILIKE $${index}
        OR c.code ILIKE $${index}
        OR c.title ILIKE $${index}
      )
    `;

    whereClause += whereClause
      ? ` AND ${searchClause}`
      : ` WHERE ${searchClause}`;

    values.push(`%${search}%`);
    index++;
  }

  const countQuery = `
    SELECT COUNT(*) AS total

    FROM course_registrations cr

    JOIN students s
      ON cr.studentid = s.id

    JOIN courses c
      ON cr.courseid = c.id

    JOIN sessions ses
      ON cr.sessionid = ses.id

    JOIN semesters sem
      ON cr.semesterid = sem.id

    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].total);

  const allowedSort = ["registeredat", "createdat", "updatedat"];

  const sortBy = allowedSort.includes(sort) ? sort : "registeredat";

  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  values.push(limit);
  values.push(offset);

  const query = `
    SELECT

      cr.id,
      cr.registeredat,
      cr.isactive,
      cr.createdat,
      cr.updatedat,

      s.id              AS student_id,
      s.matricnumber    AS student_matricnumber,
      s.firstname       AS student_firstname,
      s.lastname        AS student_lastname,

      c.id              AS course_id,
      c.code            AS course_code,
      c.title           AS course_title,
      c.creditunit            AS course_unit,

      ses.id            AS session_id,
      ses.name          AS session_name,

      sem.id            AS semester_id,
      sem.name          AS semester_name

    FROM course_registrations cr

    JOIN students s
      ON cr.studentid = s.id

    JOIN courses c
      ON cr.courseid = c.id

    JOIN sessions ses
      ON cr.sessionid = ses.id

    JOIN semesters sem
      ON cr.semesterid = sem.id

    ${whereClause}

    ORDER BY cr.${sortBy} ${sortOrder}

    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const result = await pool.query(query, values);

  return {
    courseRegistrations: result.rows.map(mapCourseRegistration),
    pagination: buildPagination(page, limit, total),
  };
};

export const getCourseRegistrationById = async (id) => {
  const result = await pool.query(
    `
    SELECT

      cr.id,
      cr.registeredat,
      cr.isactive,
      cr.createdat,
      cr.updatedat,

      s.id              AS student_id,
      s.matricnumber    AS student_matricnumber,
      s.firstname       AS student_firstname,
      s.lastname        AS student_lastname,

      c.id              AS course_id,
      c.code            AS course_code,
      c.title           AS course_title,
      c.creditunit            AS course_unit,

      ses.id            AS session_id,
      ses.name          AS session_name,

      sem.id            AS semester_id,
      sem.name          AS semester_name

    FROM course_registrations cr

    JOIN students s
      ON cr.studentid = s.id

    JOIN courses c
      ON cr.courseid = c.id

    JOIN sessions ses
      ON cr.sessionid = ses.id

    JOIN semesters sem
      ON cr.semesterid = sem.id

    WHERE cr.id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, "Course registration not found");
  }

  return mapCourseRegistration(result.rows[0]);
};

export const updateCourseRegistration = async (id, data) => {
  await entityExists(
    "course_registrations",
    id,
    "Course registration not found",
  );

  const { studentId, courseId, sessionId, semesterId } = data;

  await ensureActive({
    table: "students",
    id: studentId,
    message: "Student not found",
  });

  await ensureActive({
    table: "courses",
    id: courseId,
    message: "Course not found",
  });

  await ensureActive({
    table: "sessions",
    id: sessionId,
    message: "Session not found",
  });

  await ensureActive({
    table: "semesters",
    id: semesterId,
    message: "Semester not found",
  });

  await checkDuplicate({
    table: "course_registrations",
    conditions: {
      studentid: studentId,
      courseid: courseId,
      sessionid: sessionId,
      semesterid: semesterId,
    },
    excludeId: id,
    message:
      "Student has already registered this course for the selected session and semester",
  });

  await pool.query(
    `
    UPDATE course_registrations
    SET
      studentid = $1,
      courseid = $2,
      sessionid = $3,
      semesterid = $4,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $5
    `,
    [studentId, courseId, sessionId, semesterId, id],
  );

  return await getCourseRegistrationById(id);
};

export const deactivateCourseRegistration = async (id) => {
  await softDelete("course_registrations", id, "Course registration not found");

  return await getCourseRegistrationById(id);
};

export const restoreCourseRegistration = async (id) => {
  await restoreEntity(
    "course_registrations",
    id,
    "Course registration not found",
  );

  return await getCourseRegistrationById(id);
};
