import pool from "../config/database.js";

import apiError from "../utils/apiError.js";

import calculateGPA from "../utils/calculateGPA.js";
import transcriptSummary from "../utils/transcriptSummary.js";

import mapTranscript from "../utils/mappers/transcriptMapper.js";

export const getStudentTranscript = async (studentId) => {
  // Verify student exists
  const studentResult = await pool.query(
    `
      SELECT
        s.id,
        s.matricnumber,
        s.firstname,
        s.middlename,
        s.lastname,
        s.gender,
        s.email,
        s.phone,
        s.photo,

        d.id   AS department_id,
        d.name AS department_name,

        l.id   AS level_id,
        l.name AS level_name,

        ses.id          AS session_id,
        ses.name        AS session_name,
        ses.iscurrent   AS session_iscurrent
      
        FROM students s

      JOIN departments d
        ON s.departmentid = d.id

      JOIN levels l
        ON s.levelid = l.id

      JOIN sessions ses
        ON s.sessionid = ses.id

      WHERE s.id = $1
        AND s.isactive = true
    `,
    [studentId],
  );

  if (!studentResult.rows.length) {
    throw apiError(404, "Student not found");
  }

  const student = studentResult.rows[0];

  const transcriptResult = await pool.query(
    `
    SELECT

      r.id,
      r.ca_score,
      r.exam_score,
      r.total_score,
      r.grade,
      r.gradepoint,
      r.remark,

      c.id           AS course_id,
      c.code         AS course_code,
      c.title        AS course_title,
      c.creditunit   AS course_creditunit,

    ses.id          AS session_id,
    ses.name        AS session_name,
    ses.startdate   AS session_startdate,
    ses.iscurrent   AS session_iscurrent,

    sem.id          AS semester_id,
    sem.name        AS semester_name,
    sem.startdate   AS semester_startdate,
    sem.iscurrent   AS semester_iscurrent

    FROM results r

    JOIN courses c
      ON r.courseid = c.id

    JOIN sessions ses
      ON r.sessionid = ses.id

    JOIN semesters sem
      ON r.semesterid = sem.id

    WHERE r.studentid = $1
      AND r.isactive = true
      AND r.isapproved = true

    ORDER BY
      ses.startdate,
      sem.startdate,
      c.code
  `,
    [studentId],
  );
  const sessionMap = new Map();

  for (const row of transcriptResult.rows) {
    if (!sessionMap.has(row.session_id)) {
      sessionMap.set(row.session_id, {
        id: row.session_id,
        name: row.session_name,
        isCurrent: row.session_iscurrent,
        semesters: new Map(),
      });
    }

    const session = sessionMap.get(row.session_id);

    if (!session.semesters.has(row.semester_id)) {
      session.semesters.set(row.semester_id, {
        id: row.semester_id,
        name: row.semester_name,
        isCurrent: row.semester_iscurrent,
        courses: [],
      });
    }

    const semester = session.semesters.get(row.semester_id);

    semester.courses.push({
      id: row.course_id,
      code: row.course_code,
      title: row.course_title,
      creditUnit: Number(row.course_creditunit),

      caScore: Number(row.ca_score),
      examScore: Number(row.exam_score),
      totalScore: Number(row.total_score),

      grade: row.grade,
      gradePoint: Number(row.gradepoint),

      remark: row.remark,
    });
  }
  const sessions = [];
  const semesterSummaries = [];

  for (const session of sessionMap.values()) {
    const semesters = [];

    for (const semester of session.semesters.values()) {
      const gpa = calculateGPA(semester.courses);

      semester.gpa = gpa.gpa;
      semester.totalCredits = gpa.totalCredits;
      semester.totalPoints = gpa.totalPoints;

      semester.summary = gpa;

      semesters.push(semester);
      semesterSummaries.push(semester);
    }

    sessions.push({
      id: session.id,
      name: session.name,
      semesters,
    });
  }
  return mapTranscript({
    student: {
      id: student.id,
      matricNumber: student.matricnumber,
      firstName: student.firstname,
      middleName: student.middlename,
      lastName: student.lastname,
      gender: student.gender,
      email: student.email,
      phone: student.phone,
      photo: student.photo,

      department: {
        id: student.department_id,
        name: student.department_name,
      },

      level: {
        id: student.level_id,
        name: student.level_name,
      },

      session: {
        id: student.session_id,
        name: student.session_name,
        isCurrent: student.session_iscurrent,
      },
    },

    summary: transcriptSummary(semesterSummaries),

    sessions,
  });
};
