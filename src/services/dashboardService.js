import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import calculateGPA from "../utils/calculateGPA.js";

export const getAdminDashboard = async () => {
  const [
    students,
    courses,
    departments,
    faculties,
    results,
    pendingResults,
    activeSession,
    activeSemester,
    recentStudents,
    recentResults,
    departmentStatistics,
    gradeDistribution,
    passStatistics,
    studentGrowth,
  ] = await Promise.all([
    pool.query(`
      SELECT COUNT(*) AS total
      FROM students
      WHERE isactive = true
    `),

    pool.query(`
      SELECT COUNT(*) AS total
      FROM courses
      WHERE isactive = true
    `),

    pool.query(`
      SELECT COUNT(*) AS total
      FROM departments
      WHERE isactive = true
    `),

    pool.query(`
      SELECT COUNT(*) AS total
      FROM faculties
      WHERE isactive = true
    `),

    pool.query(`
      SELECT COUNT(*) AS total
      FROM results
      WHERE isactive = true
    `),

    pool.query(`
      SELECT COUNT(*) AS total
      FROM results
      WHERE isactive = true
        AND isapproved = false
    `),

    pool.query(`
     SELECT
    id,
    name,
    startdate,
    enddate
    FROM sessions
    WHERE iscurrent = true
    LIMIT 1
    `),

    pool.query(`
      SELECT
    id,
    name,
    startdate,
    enddate
    FROM semesters
    WHERE iscurrent = true
    LIMIT 1
    `),
    pool.query(`
    SELECT
        s.id,
        s.matricnumber,
        s.firstname,
        s.lastname,
        s.createdat,

        d.name AS department_name,

        l.name AS level_name

    FROM students s

    JOIN departments d
        ON s.departmentid = d.id

    JOIN levels l
        ON s.levelid = l.id

    WHERE s.isactive = true

    ORDER BY s.createdat DESC

    LIMIT 5
`),

    pool.query(`
    SELECT

        r.id,
        r.total_score,
        r.grade,
        r.createdat,

        s.firstname,
        s.lastname,
        s.matricnumber,

        c.code,
        c.title

    FROM results r

    JOIN students s
        ON r.studentid = s.id

    JOIN courses c
        ON r.courseid = c.id

    WHERE r.isactive = true

    ORDER BY r.createdat DESC

    LIMIT 5
`),
    pool.query(`
SELECT

    d.id,
    d.name,

    COUNT(s.id)::int AS students

    FROM departments d

    LEFT JOIN students s
    ON d.id = s.departmentid
    AND s.isactive = true

    GROUP BY d.id

    ORDER BY students DESC;
`),
    pool.query(`
SELECT

    grade,

    COUNT(*)::int AS total

FROM results

WHERE isapproved = true
AND isactive = true

GROUP BY grade

ORDER BY grade
`),
    pool.query(`
SELECT

COUNT(*) FILTER (WHERE grade <> 'F')::int AS passed,

COUNT(*) FILTER (WHERE grade = 'F')::int AS failed

FROM results

WHERE isapproved = true
AND isactive = true
`),
    pool.query(`
SELECT

DATE(createdat) AS date,

COUNT(*)::int AS students

FROM students

GROUP BY DATE(createdat)

ORDER BY date
`),
  ]);

  return {
    overview: {
      students: Number(students.rows[0].total),
      courses: Number(courses.rows[0].total),
      departments: Number(departments.rows[0].total),
      faculties: Number(faculties.rows[0].total),
      results: Number(results.rows[0].total),
      pendingResults: Number(pendingResults.rows[0].total),

      activeSession:
        activeSession.rows.length > 0 ? activeSession.rows[0] : null,

      activeSemester:
        activeSemester.rows.length > 0 ? activeSemester.rows[0] : null,
    },

    recentStudents: recentStudents.rows.map((student) => ({
      id: student.id,
      matricNumber: student.matricnumber,
      firstName: student.firstname,
      lastName: student.lastname,
      department: student.department_name,
      level: student.level_name,
      createdAt: student.createdat,
    })),

    recentResults: recentResults.rows.map((result) => ({
      id: result.id,

      student: {
        matricNumber: result.matricnumber,
        fullName: `${result.firstname} ${result.lastname}`,
      },

      course: {
        code: result.code,
        title: result.title,
      },

      score: Number(result.total_score),
      grade: result.grade,

      createdAt: result.createdat,
    })),

    departmentStatistics: departmentStatistics.rows.map((dep) => ({
      id: dep.id,
      name: dep.name,
      students: Number(dep.students),
    })),

    gradeDistribution: gradeDistribution.rows.map((item) => ({
      grade: item.grade,
      total: Number(item.total),
    })),

    passStatistics: {
      passed: Number(passStatistics.rows[0].passed),
      failed: Number(passStatistics.rows[0].failed),
    },

    studentGrowth: studentGrowth.rows.map((item) => ({
      date: item.date,
      students: Number(item.students),
    })),
  };
};

export const getStudentDashboard = async (user) => {
  const { studentid } = user;

  if (!studentid) {
    throw apiError(404, "Student profile not linked to this account");
  }

  const [
    studentResult,
    currentSession,
    currentSemester,
    registeredCourses,
    approvedResults,
    recentResults,
    currentCourses,
  ] = await Promise.all([
    pool.query(
      `
      SELECT
          s.id,
          s.matricnumber,
          s.firstname,
          s.middlename,
          s.lastname,
          s.photo,

          d.name AS department_name,
          l.name AS level_name

      FROM students s

      JOIN departments d
        ON s.departmentid = d.id

      JOIN levels l
        ON s.levelid = l.id

      WHERE s.id = $1
      `,
      [studentid],
    ),

    pool.query(`
      SELECT id, name
      FROM sessions
      WHERE iscurrent = true
      LIMIT 1
    `),

    pool.query(`
      SELECT id, name
      FROM semesters
      WHERE iscurrent = true
      LIMIT 1
    `),

    pool.query(
      `
      SELECT COUNT(*) AS total
      FROM course_registrations
      WHERE
          studentid = $1
      AND isactive = true
      `,
      [studentid],
    ),

    pool.query(
      `
      SELECT

          r.gradepoint,

          c.creditunit

      FROM results r

      JOIN courses c
          ON r.courseid = c.id

      JOIN semesters sem
          ON r.semesterid = sem.id

      WHERE
          r.studentid = $1
      AND r.isapproved = true
      AND r.isactive = true
      AND sem.iscurrent = true
      `,
      [studentid],
    ),

    pool.query(
      `
      SELECT

          r.total_score,
          r.grade,

          c.code,
          c.title,
          c.creditunit

      FROM results r

      JOIN courses c
          ON r.courseid = c.id

      WHERE
          r.studentid = $1
      AND r.isapproved = true
      AND r.isactive = true

      ORDER BY r.createdat DESC

      LIMIT 5
      `,
      [studentid],
    ),
    pool.query(
      `
  SELECT

      c.id,
      c.code,
      c.title,
      c.creditunit

  FROM course_registrations cr

  JOIN courses c
      ON cr.courseid = c.id

  JOIN semesters sem
      ON cr.semesterid = sem.id

  WHERE
      cr.studentid = $1
  AND cr.isactive = true
  AND sem.iscurrent = true

  ORDER BY c.code
  `,
      [studentid],
    ),
  ]);

  if (!studentResult.rows.length) {
    throw apiError(404, "Student not found");
  }

  const student = studentResult.rows[0];

  const gpa = calculateGPA(
    approvedResults.rows.map((row) => ({
      creditUnit: Number(row.creditunit),
      gradePoint: Number(row.gradepoint),
    })),
  );

  return {
    student: {
      id: student.id,
      matricNumber: student.matricnumber,
      firstName: student.firstname,
      middleName: student.middlename,
      lastName: student.lastname,
      fullName:
        `${student.firstname} ${student.middlename ?? ""} ${student.lastname}`
          .replace(/\s+/g, " ")
          .trim(),
      department: student.department_name,
      level: student.level_name,
      photo: student.photo,
    },

    overview: {
      currentGPA: gpa.gpa,
      totalCredits: gpa.totalCredits,
      registeredCourses: Number(registeredCourses.rows[0].total),

      currentSession:
        currentSession.rows.length > 0 ? currentSession.rows[0] : null,

      currentSemester:
        currentSemester.rows.length > 0 ? currentSemester.rows[0] : null,
    },

    recentResults: recentResults.rows.map((row) => ({
      course: {
        code: row.code,
        title: row.title,
        creditUnit: Number(row.creditunit),
      },
      score: Number(row.total_score),
      grade: row.grade,
    })),

    currentCourses: currentCourses.rows.map((course) => ({
      id: course.id,
      code: course.code,
      title: course.title,
      creditUnit: Number(course.creditunit),

      progress: 80,
    })),
    activities: [
      {
        id: 1,
        title: "Current Session",
        description: currentSession.rows[0]?.name ?? "No active session",
        date: "",
        type: "session",
      },

      {
        id: 2,
        title: "Current Semester",
        description: currentSemester.rows[0]?.name ?? "No active semester",
        date: "",
        type: "semester",
      },
    ],
  };
};
