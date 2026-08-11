import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import calculateGPA from "../utils/calculateGPA.js";
import transcriptSummary from "../utils/transcriptSummary.js";
import mapTranscript from "../utils/mappers/transcriptMapper.js";

export const getStudentTranscript = async (studentId) => {
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

        d.id AS department_id,
        d.name AS department_name,

        l.id AS level_id,
        l.name AS level_name,

        ses.id AS session_id,
        ses.name AS session_name,
        ses.iscurrent AS session_iscurrent

      FROM students s
      JOIN departments d ON s.departmentid = d.id
      JOIN levels l ON s.levelid = l.id
      JOIN sessions ses ON s.sessionid = ses.id
      WHERE s.id = $1 AND s.isactive = true
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
        cr.id AS registration_id,
        cr.registeredat,
        cr.isactive AS registration_isactive,

        c.id AS course_id,
        c.code AS course_code,
        c.title AS course_title,
        c.creditunit AS course_creditunit,

        course_dept.id AS course_department_id,
        course_dept.name AS course_department_name,

        ses.id AS session_id,
        ses.name AS session_name,
        ses.startdate AS session_startdate,
        ses.iscurrent AS session_iscurrent,

        sem.id AS semester_id,
        sem.name AS semester_name,
        sem.startdate AS semester_startdate,
        sem.iscurrent AS semester_iscurrent,

        r.id AS result_id,
        r.ca_score,
        r.exam_score,
        r.total_score,
        r.grade,
        r.gradepoint,
        r.remark

      FROM course_registrations cr
      JOIN courses c ON cr.courseid = c.id
      LEFT JOIN departments course_dept ON c.departmentid = course_dept.id
      JOIN sessions ses ON cr.sessionid = ses.id
      JOIN semesters sem ON cr.semesterid = sem.id
      LEFT JOIN results r
        ON r.studentid = cr.studentid
        AND r.courseid = cr.courseid
        AND r.sessionid = cr.sessionid
        AND r.semesterid = cr.semesterid
        AND r.isactive = true
        AND r.isapproved = true

      WHERE cr.studentid = $1 AND cr.isactive = true
      ORDER BY
        ses.startdate ASC,
        sem.startdate ASC,
        c.code ASC
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

    let status = "current";
    if (row.result_id) {
      if (row.grade && row.grade.toUpperCase() === "F") {
        status = "failed";
      } else if (row.grade) {
        status = "completed";
      }
    }

    semester.courses.push({
      id: row.course_id,
      registrationId: row.registration_id,
      code: row.course_code,
      title: row.course_title,
      creditUnit: Number(row.course_creditunit || 0),
      department: {
        id: row.course_department_id || null,
        name: row.course_department_name || null,
      },
      registeredAt: row.registeredat,
      status,
      resultId: row.result_id || null,
      caScore: row.ca_score !== null ? Number(row.ca_score) : null,
      examScore: row.exam_score !== null ? Number(row.exam_score) : null,
      totalScore: row.total_score !== null ? Number(row.total_score) : null,
      grade: row.grade || null,
      gradePoint: row.gradepoint !== null ? Number(row.gradepoint) : null,
      remark: row.remark || null,
    });
  }

  const sessions = [];
  const semesterSummaries = [];

  for (const session of sessionMap.values()) {
    const semesters = [];

    for (const semester of session.semesters.values()) {
      const gradedCourses = semester.courses.filter(
        (course) =>
          course.resultId && course.grade && course.gradePoint !== null,
      );

      let gpa = { gpa: 0, totalCredits: 0, totalPoints: 0 };
      if (gradedCourses.length > 0) {
        gpa = calculateGPA(gradedCourses);
      }

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
      isCurrent: session.isCurrent,
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
      department: { id: student.department_id, name: student.department_name },
      level: { id: student.level_id, name: student.level_name },
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
