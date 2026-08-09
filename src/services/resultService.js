import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import { buildPagination } from "../utils/pagination.js";
import mapResult from "../utils/mappers/resultMapper.js";
import entityExists from "../utils/entityExists.js";
import ensureActive from "../utils/ensureActive.js";
import checkDuplicate from "../utils/checkDuplicate.js";
import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";
import calculateGrade from "../utils/calculateGrade.js";
import XLSX from "xlsx";

export const createResult = async (data) => {
  const { studentId, courseId, sessionId, semesterId, caScore, examScore } =
    data;

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
    table: "results",
    conditions: {
      studentid: studentId,
      courseid: courseId,
      sessionid: sessionId,
      semesterid: semesterId,
    },
    message: "Result already exists",
  });

  const { totalScore, grade, gradePoint, remark } = calculateGrade(
    caScore,
    examScore,
  );

  const result = await pool.query(
    `
    INSERT INTO results
    (
      studentid,
      courseid,
      sessionid,
      semesterid,
      ca_score,
      exam_score,
      total_score,
      grade,
      gradepoint,
      remark
    )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING id
    `,
    [
      studentId,
      courseId,
      sessionId,
      semesterId,
      caScore,
      examScore,
      totalScore,
      grade,
      gradePoint,
      remark,
    ],
  );

  return await getResultById(result.rows[0].id);
};

export const getResults = async (filters) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "active",
    studentId,
    courseId,
    sessionId,
    semesterId,
    approved,
    sort = "createdat",
    order = "desc",
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "";
  const values = [];
  let index = 1;

  if (status === "active") {
    whereClause += " WHERE r.isactive = true";
  } else if (status === "inactive") {
    whereClause += " WHERE r.isactive = false";
  }

  if (studentId) {
    whereClause += whereClause
      ? ` AND r.studentid = $${index}`
      : ` WHERE r.studentid = $${index}`;

    values.push(studentId);
    index++;
  }

  if (courseId) {
    whereClause += whereClause
      ? ` AND r.courseid = $${index}`
      : ` WHERE r.courseid = $${index}`;

    values.push(courseId);
    index++;
  }

  if (sessionId) {
    whereClause += whereClause
      ? ` AND r.sessionid = $${index}`
      : ` WHERE r.sessionid = $${index}`;

    values.push(sessionId);
    index++;
  }

  if (semesterId) {
    whereClause += whereClause
      ? ` AND r.semesterid = $${index}`
      : ` WHERE r.semesterid = $${index}`;

    values.push(semesterId);
    index++;
  }

  if (approved !== undefined) {
    whereClause += whereClause
      ? ` AND r.isapproved = $${index}`
      : ` WHERE r.isapproved = $${index}`;

    values.push(approved === "true");
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

    FROM results r

    JOIN students s
      ON r.studentid = s.id

    JOIN courses c
      ON r.courseid = c.id

    JOIN sessions ses
      ON r.sessionid = ses.id

    JOIN semesters sem
      ON r.semesterid = sem.id

    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].total);

  const allowedSort = ["createdat", "updatedat", "total_score", "grade"];

  const sortBy = allowedSort.includes(sort) ? sort : "createdat";

  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  values.push(limit);
  values.push(offset);

  const query = `
    SELECT

      r.id,
      r.ca_score,
      r.exam_score,
      r.total_score,
      r.grade,
      r.gradepoint,
      r.remark,
      r.isapproved,
      r.isactive,
      r.createdat,
      r.updatedat,

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

    FROM results r

    JOIN students s
      ON r.studentid = s.id

    JOIN courses c
      ON r.courseid = c.id

    JOIN sessions ses
      ON r.sessionid = ses.id

    JOIN semesters sem
      ON r.semesterid = sem.id

    ${whereClause}

    ORDER BY r.${sortBy} ${sortOrder}

    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const result = await pool.query(query, values);

  return {
    results: result.rows.map(mapResult),
    pagination: buildPagination(page, limit, total),
  };
};

export const getResultById = async (id) => {
  const result = await pool.query(
    `
    SELECT

      r.id,
      r.ca_score,
      r.exam_score,
      r.total_score,
      r.grade,
      r.gradepoint,
      r.remark,
      r.isapproved,
      r.isactive,
      r.createdat,
      r.updatedat,

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

    FROM results r

    JOIN students s
      ON r.studentid = s.id

    JOIN courses c
      ON r.courseid = c.id

    JOIN sessions ses
      ON r.sessionid = ses.id

    JOIN semesters sem
      ON r.semesterid = sem.id

    WHERE r.id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, "Result not found");
  }

  return mapResult(result.rows[0]);
};

export const updateResult = async (id, data) => {
  await entityExists("results", id, "Result not found");

  const { studentId, courseId, sessionId, semesterId, caScore, examScore } =
    data;

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
    table: "results",
    conditions: {
      studentid: studentId,
      courseid: courseId,
      sessionid: sessionId,
      semesterid: semesterId,
    },
    excludeId: id,
    message: "Result already exists",
  });

  const { totalScore, grade, gradePoint, remark } = calculateGrade(
    caScore,
    examScore,
  );

  await pool.query(
    `
    UPDATE results
    SET
      studentid = $1,
      courseid = $2,
      sessionid = $3,
      semesterid = $4,
      ca_score = $5,
      exam_score = $6,
      total_score = $7,
      grade = $8,
      gradepoint = $9,
      remark = $10,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $11
    `,
    [
      studentId,
      courseId,
      sessionId,
      semesterId,
      caScore,
      examScore,
      totalScore,
      grade,
      gradePoint,
      remark,
      id,
    ],
  );

  return await getResultById(id);
};

export const approveResult = async (id) => {
  const result = await pool.query(
    `
    UPDATE results
    SET
      isapproved = true,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, "Result not found");
  }

  return await getResultById(id);
};

export const deactivateResult = async (id) => {
  await softDelete("results", id, "Result not found");

  return await getResultById(id);
};

export const restoreResult = async (id) => {
  await restoreEntity("results", id, "Result not found");

  return await getResultById(id);
};

export const getResultStatistics = async (filters = {}) => {
  const { search = "", sessionId, semesterId } = filters;

  const values = [];
  let index = 1;

  let resultWhere = "WHERE r.isactive = true";
  let registrationWhere = "WHERE cr.isactive = true";

  // Session filter
  if (sessionId) {
    resultWhere += ` AND r.sessionid = $${index}`;
    registrationWhere += ` AND cr.sessionid = $${index}`;

    values.push(sessionId);
    index++;
  }

  // Semester filter
  if (semesterId) {
    resultWhere += ` AND r.semesterid = $${index}`;
    registrationWhere += ` AND cr.semesterid = $${index}`;

    values.push(semesterId);
    index++;
  }

  // Search filter
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

    resultWhere += ` AND ${searchClause}`;

    registrationWhere += ` AND (
      s.firstname ILIKE $${index}
      OR s.lastname ILIKE $${index}
      OR s.matricnumber ILIKE $${index}
      OR c.code ILIKE $${index}
      OR c.title ILIKE $${index}
    )`;

    values.push(`%${search}%`);
    index++;
  }

  /*
   * TOTAL RESULTS
   */
  const totalResultsQuery = `
    SELECT COUNT(*) AS total
    FROM results r

    JOIN students s
      ON r.studentid = s.id

    JOIN courses c
      ON r.courseid = c.id

    ${resultWhere}
  `;

  /*
   * APPROVED RESULTS
   */
  const approvedResultsQuery = `
    SELECT COUNT(*) AS total
    FROM results r

    JOIN students s
      ON r.studentid = s.id

    JOIN courses c
      ON r.courseid = c.id

    ${resultWhere}
      AND r.isapproved = true
  `;

  /*
   * PENDING RESULTS
   */
  const pendingResultsQuery = `
    SELECT COUNT(*) AS total
    FROM results r

    JOIN students s
      ON r.studentid = s.id

    JOIN courses c
      ON r.courseid = c.id

    ${resultWhere}
      AND r.isapproved = false
  `;

  /*
   * MISSING RESULTS
   *
   * A missing result is an active course registration
   * that does not have an active result.
   */
  const missingResultsQuery = `
    SELECT COUNT(*) AS total
    FROM course_registrations cr

    JOIN students s
      ON cr.studentid = s.id

    JOIN courses c
      ON cr.courseid = c.id

    LEFT JOIN results r
      ON r.studentid = cr.studentid
      AND r.courseid = cr.courseid
      AND r.sessionid = cr.sessionid
      AND r.semesterid = cr.semesterid
      AND r.isactive = true

    ${registrationWhere}
      AND r.id IS NULL
  `;

  const [totalResults, approvedResults, pendingResults, missingResults] =
    await Promise.all([
      pool.query(totalResultsQuery, values),
      pool.query(approvedResultsQuery, values),
      pool.query(pendingResultsQuery, values),
      pool.query(missingResultsQuery, values),
    ]);

  return {
    totalResults: Number(totalResults.rows[0].total),
    approved: Number(approvedResults.rows[0].total),
    pending: Number(pendingResults.rows[0].total),
    missing: Number(missingResults.rows[0].total),
  };
};
