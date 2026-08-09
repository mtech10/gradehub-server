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

export const getCurrentStudentRegistrationData = async (studentId) => {
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

  const semesterResult = await pool.query(
    `
    SELECT
      sem.id,
      sem.name,
      sem.startdate,
      sem.enddate,
      sem.iscurrent,

      ses.id AS session_id,
      ses.name AS session_name

    FROM semesters sem

    JOIN sessions ses
      ON sem.sessionid = ses.id

    WHERE sem.iscurrent = true
      AND sem.isactive = true
      AND ses.isactive = true

    ORDER BY sem.startdate DESC

    LIMIT 1
    `,
  );

  if (semesterResult.rows.length === 0) {
    throw apiError(404, "No current semester is available");
  }

  const currentSemester = semesterResult.rows[0];

  const registrationResult = await pool.query(
    `
    SELECT
      cr.id,
      cr.registeredat,
      cr.isactive,

      c.id AS course_id,
      c.code AS course_code,
      c.title AS course_title,
      c.creditunit AS course_unit

    FROM course_registrations cr

    JOIN courses c
      ON cr.courseid = c.id

    WHERE cr.studentid = $1
      AND cr.sessionid = $2
      AND cr.semesterid = $3
      AND cr.isactive = true

    ORDER BY c.code ASC
    `,
    [studentId, currentSemester.session_id, currentSemester.id],
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
      id: currentSemester.session_id,
      name: currentSemester.session_name,
    },

    semester: {
      id: currentSemester.id,
      name: currentSemester.name,
      startDate: currentSemester.startdate,
      endDate: currentSemester.enddate,
      isCurrent: currentSemester.iscurrent,
    },

    registeredCourses: registrationResult.rows.map((row) => ({
      registrationId: row.id,
      registeredAt: row.registeredat,

      id: row.course_id,
      code: row.course_code,
      title: row.course_title,

      creditUnit: Number(row.course_unit),

      semester: {
        id: currentSemester.id,
        name: currentSemester.name,
      },

      status: "Registered",
    })),

    rules: {
      minUnits: 12,
      maxUnits: 24,
      status: "Open",
      deadline: null,
    },
  };
};

export const processStudentRegistration = async ({
  studentId,
  registerCourseCodes = [],
  dropCourseCodes = [],
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * 1. Get the student's current academic context
     */
    const studentResult = await client.query(
      `
      SELECT
        s.id,
        s.departmentid,
        s.levelid
      FROM students s
      WHERE s.id = $1
        AND s.isactive = true
      `,
      [studentId],
    );

    if (studentResult.rows.length === 0) {
      throw apiError(404, "Student not found");
    }

    const student = studentResult.rows[0];

    /*
     * 2. Get the current semester and session
     */
    const semesterResult = await client.query(
      `
      SELECT
        sem.id AS semester_id,
        sem.name AS semester_name,
        ses.id AS session_id,
        ses.name AS session_name
      FROM semesters sem
      JOIN sessions ses
        ON sem.sessionid = ses.id
      WHERE sem.iscurrent = true
        AND sem.isactive = true
        AND ses.isactive = true
      ORDER BY sem.startdate DESC
      LIMIT 1
      `,
    );

    if (semesterResult.rows.length === 0) {
      throw apiError(404, "No current semester is available");
    }

    const current = semesterResult.rows[0];

    /*
     * 3. Get currently registered courses
     */
    const registeredResult = await client.query(
      `
      SELECT
        cr.id,
        c.id AS course_id,
        c.code,
        c.title,
        c.creditunit
      FROM course_registrations cr
      JOIN courses c
        ON cr.courseid = c.id
      WHERE cr.studentid = $1
        AND cr.sessionid = $2
        AND cr.semesterid = $3
        AND cr.isactive = true
      `,
      [studentId, current.session_id, current.semester_id],
    );

    /*
     * 4. Remove duplicates from incoming codes
     */
    const registerCodes = [
      ...new Set(
        registerCourseCodes
          .map((code) => String(code).trim().toUpperCase())
          .filter(Boolean),
      ),
    ];

    const dropCodes = [
      ...new Set(
        dropCourseCodes
          .map((code) => String(code).trim().toUpperCase())
          .filter(Boolean),
      ),
    ];

    /*
     * 5. Find courses to register
     */
    let coursesToRegister = [];

    if (registerCodes.length > 0) {
      const courseResult = await client.query(
        `
        SELECT
          id,
          code,
          title,
          creditunit
        FROM courses
        WHERE UPPER(code) = ANY($1::text[])
          AND departmentid = $2
          AND levelid = $3
          AND semesterid = $4
          AND isactive = true
        `,
        [
          registerCodes,
          student.departmentid,
          student.levelid,
          current.semester_id,
        ],
      );

      coursesToRegister = courseResult.rows;

      /*
       * Make sure every submitted code actually exists
       */
      const foundCodes = new Set(
        coursesToRegister.map((course) => course.code.toUpperCase()),
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

    /*
     * 6. Determine courses remaining after drops
     */
    const droppedRegisteredCourses = registeredResult.rows.filter((course) =>
      dropCodes.includes(course.code.toUpperCase()),
    );

    const remainingRegisteredCourses = registeredResult.rows.filter(
      (course) => !dropCodes.includes(course.code.toUpperCase()),
    );

    /*
     * 7. Prevent registering a course that is already registered
     */
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
        `Already registered: ${alreadyRegistered
          .map((course) => course.code)
          .join(", ")}`,
      );
    }

    /*
     * 8. Calculate projected units
     */
    const remainingUnits = remainingRegisteredCourses.reduce(
      (total, course) => total + Number(course.creditunit || 0),
      0,
    );

    const newUnits = coursesToRegister.reduce(
      (total, course) => total + Number(course.creditunit || 0),
      0,
    );

    const projectedUnits = remainingUnits + newUnits;

    /*
     * 9. Registration rules
     */
    const MIN_UNITS = 12;
    const MAX_UNITS = 24;

    if (projectedUnits < MIN_UNITS) {
      throw apiError(
        400,
        `Minimum registration load is ${MIN_UNITS} units. You selected ${projectedUnits} units.`,
      );
    }

    if (projectedUnits > MAX_UNITS) {
      throw apiError(
        400,
        `Maximum registration load is ${MAX_UNITS} units. You selected ${projectedUnits} units.`,
      );
    }

    /*
     * 10. Drop courses
     */
    if (droppedRegisteredCourses.length > 0) {
      const dropIds = droppedRegisteredCourses.map((course) => course.id);

      await client.query(
        `
        UPDATE course_registrations
        SET
          isactive = false,
          updatedat = CURRENT_TIMESTAMP
        WHERE id = ANY($1::uuid[])
        `,
        [dropIds],
      );
    }

    /*
     * 11. Register new courses
     */
    for (const course of coursesToRegister) {
      await client.query(
        `
        INSERT INTO course_registrations
        (
          studentid,
          courseid,
          sessionid,
          semesterid,
          isactive
        )
        VALUES ($1, $2, $3, $4, true)
        `,
        [studentId, course.id, current.session_id, current.semester_id],
      );
    }

    /*
     * 12. Commit everything
     */
    await client.query("COMMIT");

    /*
     * 13. Return fresh registration information
     */
    const finalResult = await client.query(
      `
      SELECT
        cr.id AS registration_id,
        cr.registeredat,
        c.id AS course_id,
        c.code,
        c.title,
        c.creditunit
      FROM course_registrations cr
      JOIN courses c
        ON cr.courseid = c.id
      WHERE cr.studentid = $1
        AND cr.sessionid = $2
        AND cr.semesterid = $3
        AND cr.isactive = true
      ORDER BY c.code ASC
      `,
      [studentId, current.session_id, current.semester_id],
    );

    return {
      session: {
        id: current.session_id,
        name: current.session_name,
      },

      semester: {
        id: current.semester_id,
        name: current.semester_name,
      },

      totalUnits: projectedUnits,

      courses: finalResult.rows.map((course) => ({
        registrationId: course.registration_id,
        registeredAt: course.registeredat,
        id: course.course_id,
        code: course.code,
        title: course.title,
        creditUnit: Number(course.creditunit),
        status: "Registered",
      })),
    };
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
