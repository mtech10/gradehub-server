import pool from "../config/database.js";
import apiError from "../utils/apiError.js";

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
      c.creditunit      AS course_unit,

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
    LIMIT $${index} OFFSET $${index + 1}
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
      c.creditunit      AS course_unit,

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

export const getCurrentStudentRegistrationData = async (
  studentId,
  sessionId,
) => {
  const studentResult = await pool.query(
    `
    SELECT
      s.id,
      s.matricnumber,
      s.firstname,
      s.lastname,
      d.id AS department_id,
      d.name AS department_name,
      d.code AS department_code,
      l.id AS level_id,
      l.name AS level_name
    FROM students s
    JOIN departments d
      ON s.departmentid = d.id
    JOIN levels l
      ON s.levelid = l.id
    WHERE s.id = $1
      AND s.isactive = true
    `,
    [studentId],
  );

  if (studentResult.rows.length === 0) {
    throw apiError(404, "Student not found");
  }

  const student = studentResult.rows[0];

  let currentSession;

  if (sessionId) {
    const sessionResult = await pool.query(
      `SELECT id AS session_id, name AS session_name FROM sessions WHERE id = $1 AND isactive = true`,
      [sessionId],
    );
    if (sessionResult.rows.length === 0) {
      throw apiError(404, "Provided academic session is invalid or inactive");
    }
    currentSession = sessionResult.rows[0];
  } else {
    // Fallback to the current active session
    const sessionResult = await pool.query(
      `SELECT id AS session_id, name AS session_name FROM sessions WHERE iscurrent = true AND isactive = true LIMIT 1`,
    );
    if (sessionResult.rows.length === 0) {
      throw apiError(404, "No current session is available");
    }
    currentSession = sessionResult.rows[0];
  }

  // Fetch ALL registrations for the session, ignoring semesterid
  const registrationResult = await pool.query(
    `
    SELECT
      cr.id,
      cr.registeredat,
      cr.isactive,
      c.id AS course_id,
      c.code AS course_code,
      c.title AS course_title,
      c.creditunit AS course_unit,
      sem.id AS semester_id,
      sem.name AS semester_name
    FROM course_registrations cr
    JOIN courses c
      ON cr.courseid = c.id
    JOIN semesters sem
      ON cr.semesterid = sem.id
    WHERE cr.studentid = $1
      AND cr.sessionid = $2
      AND cr.isactive = true
    ORDER BY sem.startdate ASC, c.code ASC
    `,
    [studentId, currentSession.session_id],
  );

  return {
    student: {
      id: student.id,
      matricNumber: student.matricnumber,
      firstName: student.firstname,
      lastName: student.lastname,
      department: {
        id: student.department_id,
        name: student.department_name,
        code: student.department_code,
      },
      level: {
        id: student.level_id,
        name: student.level_name,
      },
    },
    session: {
      id: currentSession.session_id,
      name: currentSession.session_name,
    },
    registeredCourses: registrationResult.rows.map((row) => ({
      registrationId: row.id,
      registeredAt: row.registeredat,
      id: row.course_id,
      code: row.course_code,
      title: row.course_title,
      creditUnit: Number(row.course_unit),
      semester: {
        id: row.semester_id,
        name: row.semester_name,
      },
      status: "Registered",
    })),
    rules: {
      minUnits: 12, // You may want to double these if they represent per-semester limits!
      maxUnits: 48, // E.g., 24 per semester = 48 per session
      status: "Open",
      deadline: null,
    },
  };
};

export const processStudentRegistration = async ({
  studentId,
  registerCourseCodes = [],
  dropCourseCodes = [],
  sessionId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const studentResult = await client.query(
      `SELECT id, departmentid, levelid FROM students WHERE id = $1 AND isactive = true`,
      [studentId],
    );

    if (studentResult.rows.length === 0)
      throw apiError(404, "Student not found");
    const student = studentResult.rows[0];

    // Find the active session being targeted
    let current;
    if (sessionId) {
      const sesRes = await client.query(
        `SELECT id AS session_id, name AS session_name FROM sessions WHERE id = $1`,
        [sessionId],
      );
      if (sesRes.rows.length === 0) throw apiError(404, "Session not found");
      current = sesRes.rows[0];
    } else {
      const sesRes = await client.query(
        `SELECT id AS session_id, name AS session_name FROM sessions WHERE iscurrent = true LIMIT 1`,
      );
      if (sesRes.rows.length === 0)
        throw apiError(404, "No current session available");
      current = sesRes.rows[0];
    }

    // Get ALL existing registered courses for the whole session
    const registeredResult = await client.query(
      `
      SELECT cr.id, c.id AS course_id, c.code, c.title, c.creditunit
      FROM course_registrations cr
      JOIN courses c ON cr.courseid = c.id
      WHERE cr.studentid = $1 AND cr.sessionid = $2 AND cr.isactive = true
      `,
      [studentId, current.session_id],
    );

    const registerCodes = [
      ...new Set(
        registerCourseCodes
          .map((c) => String(c).trim().toUpperCase())
          .filter(Boolean),
      ),
    ];
    const dropCodes = [
      ...new Set(
        dropCourseCodes
          .map((c) => String(c).trim().toUpperCase())
          .filter(Boolean),
      ),
    ];

    let coursesToRegister = [];

    if (registerCodes.length > 0) {
      // FIX: Notice we select the course's 'semesterid' here, and removed the semester filter from WHERE
      const courseResult = await client.query(
        `
        SELECT id, code, title, creditunit, semesterid
        FROM courses
        WHERE UPPER(code) = ANY($1::text[])
          AND departmentid = $2
          AND levelid = $3
          AND isactive = true
        `,
        [registerCodes, student.departmentid, student.levelid],
      );

      coursesToRegister = courseResult.rows;

      const foundCodes = new Set(
        coursesToRegister.map((c) => c.code.toUpperCase()),
      );
      const missingCodes = registerCodes.filter(
        (code) => !foundCodes.has(code),
      );
      if (missingCodes.length > 0) {
        throw apiError(
          400,
          `Course(s) not available for registration: ${missingCodes.join(", ")}`,
        );
      }
    }

    const droppedRegisteredCourses = registeredResult.rows.filter((c) =>
      dropCodes.includes(c.code.toUpperCase()),
    );
    const remainingRegisteredCourses = registeredResult.rows.filter(
      (c) => !dropCodes.includes(c.code.toUpperCase()),
    );

    const alreadyRegistered = coursesToRegister.filter((course) =>
      registeredResult.rows.some(
        (registered) =>
          registered.course_id === course.id &&
          !dropCodes.includes(course.code.toUpperCase()),
      ),
    );

    if (alreadyRegistered.length > 0) {
      throw apiError(
        400,
        `Already registered: ${alreadyRegistered.map((c) => c.code).join(", ")}`,
      );
    }

    const remainingUnits = remainingRegisteredCourses.reduce(
      (tot, c) => tot + Number(c.creditunit || 0),
      0,
    );
    const newUnits = coursesToRegister.reduce(
      (tot, c) => tot + Number(c.creditunit || 0),
      0,
    );
    const projectedUnits = remainingUnits + newUnits;

    // Optional: Adjust these rules if they apply to the whole session now instead of semester
    const MIN_UNITS = 12;
    const MAX_UNITS = 48; // Expanded for full session

    if (projectedUnits > MAX_UNITS) {
      throw apiError(
        400,
        `Maximum registration load is ${MAX_UNITS} units. You selected ${projectedUnits} units.`,
      );
    }

    if (droppedRegisteredCourses.length > 0) {
      const dropIds = droppedRegisteredCourses.map((c) => c.id);
      await client.query(
        `UPDATE course_registrations SET isactive = false, updatedat = CURRENT_TIMESTAMP WHERE id = ANY($1::uuid[])`,
        [dropIds],
      );
    }

    // Insert new registrations, linking each strictly to the semester that course belongs to!
    for (const course of coursesToRegister) {
      await client.query(
        `
        INSERT INTO course_registrations (studentid, courseid, sessionid, semesterid, isactive)
        VALUES ($1, $2, $3, $4, true)
        `,
        [studentId, course.id, current.session_id, course.semesterid], // <- course.semesterid handles the split!
      );
    }

    await client.query("COMMIT");

    return { success: true, message: "Session registration completed" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
