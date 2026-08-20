import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import { parseResultCSV } from "../utils/parseResultCSV.js";
import calculateGrade from "../utils/calculateGrade.js";

const findAcademicDetails = async ({
  sessionId,
  semesterId,
  departmentId,
  courseId,
  levelId,
}) => {
  const sessionResult = await pool.query(
    `
    SELECT id, name
    FROM sessions
    WHERE id = $1
      AND isactive = true
    LIMIT 1
    `,
    [sessionId],
  );

  if (!sessionResult.rows.length) {
    throw apiError(404, "Academic session not found");
  }

  const sessionRow = sessionResult.rows[0];

  const semesterResult = await pool.query(
    `
    SELECT id, name
    FROM semesters
    WHERE id = $1
      AND sessionid = $2
      AND isactive = true
    LIMIT 1
    `,
    [semesterId, sessionRow.id],
  );

  if (!semesterResult.rows.length) {
    throw apiError(404, "Semester not found for the selected session");
  }

  const semesterRow = semesterResult.rows[0];

  const departmentResult = await pool.query(
    `
    SELECT id, name
    FROM departments
    WHERE id = $1
      AND isactive = true
    LIMIT 1
    `,
    [departmentId],
  );

  if (!departmentResult.rows.length) {
    throw apiError(404, "Department not found");
  }

  const departmentRow = departmentResult.rows[0];

  const levelResult = await pool.query(
    `
    SELECT id, name
    FROM levels
    WHERE id = $1
      AND isactive = true
    LIMIT 1
    `,
    [levelId],
  );

  if (!levelResult.rows.length) {
    throw apiError(404, "Level not found");
  }

  const levelRow = levelResult.rows[0];

  const courseResult = await pool.query(
    `
    SELECT
      id,
      code,
      title,
      creditunit
    FROM courses
    WHERE id = $1
      AND departmentid = $2
      AND levelid = $3
      AND isactive = true
    LIMIT 1
    `,
    [courseId, departmentRow.id, levelRow.id], 
  );

  if (!courseResult.rows.length) {
    throw apiError(
      404,
      "Course does not match the selected department and level", 
    );
  }

  return {
    session: sessionRow,
    semester: semesterRow,
    department: departmentRow,
    level: levelRow,
    course: courseResult.rows[0],
  };
};

const findStudentByMatricNumber = async (matricNumber) => {
  const result = await pool.query(
    `
      SELECT
        id,
        matricnumber,
        firstname,
        lastname
      FROM students
      WHERE matricnumber = $1
        AND isactive = true
      LIMIT 1
    `,
    [matricNumber],
  );

  return result.rows[0] || null;
};

export const validateResultUpload = async ({ fileBuffer, metadata }) => {
  const { sessionId, semesterId, departmentId, courseId, levelId } = metadata;
  
  const academic = await findAcademicDetails({
    sessionId,
    semesterId,
    departmentId,
    courseId,
    levelId,
  });

  
  const rows = parseResultCSV(fileBuffer);

  const validRows = [];
  const invalidRows = [];

  
  for (const row of rows) {
    const errors = [];

    if (!row.matricNumber) {
      errors.push("Matric Number is required");
    }

    if (!Number.isFinite(row.caScore)) {
      errors.push("CA Score must be a valid number");
    } else if (row.caScore < 0 || row.caScore > 30) {
      errors.push("CA Score must be between 0 and 30");
    }

    if (!Number.isFinite(row.examScore)) {
      errors.push("Exam Score must be a valid number");
    } else if (row.examScore < 0 || row.examScore > 70) {
      errors.push("Exam Score must be between 0 and 70");
    }

    if (errors.length) {
      invalidRows.push({
        rowNumber: row.rowNumber,
        matricNumber: row.matricNumber,
        errors,
      });

      continue;
    }

    
    const studentResult = await pool.query(
      `
      SELECT
        id,
        matricnumber,
        firstname,
        lastname
      FROM students
      WHERE matricnumber = $1
        AND isactive = true
      LIMIT 1
      `,
      [row.matricNumber],
    );

    if (!studentResult.rows.length) {
      invalidRows.push({
        rowNumber: row.rowNumber,
        matricNumber: row.matricNumber,
        errors: ["Student not found"],
      });

      continue;
    }

    const student = studentResult.rows[0];

    
    const registrationResult = await pool.query(
      `
      SELECT id
      FROM course_registrations
      WHERE studentid = $1
        AND courseid = $2
        AND sessionid = $3
        AND semesterid = $4
        AND isactive = true
      LIMIT 1
      `,
      [
        student.id,
        academic.course.id,
        academic.session.id,
        academic.semester.id,
      ],
    );

    if (!registrationResult.rows.length) {
      invalidRows.push({
        rowNumber: row.rowNumber,
        matricNumber: row.matricNumber,
        studentName: `${student.firstname} ${student.lastname}`,
        errors: ["Student is not registered for this course"],
      });

      continue;
    }

    
    const existingResult = await pool.query(
      `
      SELECT id
      FROM results
      WHERE studentid = $1
        AND courseid = $2
        AND sessionid = $3
        AND semesterid = $4
        AND isactive = true
      LIMIT 1
      `,
      [
        student.id,
        academic.course.id,
        academic.session.id,
        academic.semester.id,
      ],
    );

    if (existingResult.rows.length) {
      invalidRows.push({
        rowNumber: row.rowNumber,
        matricNumber: row.matricNumber,
        studentName: `${student.firstname} ${student.lastname}`,
        errors: ["Result already exists"],
      });

      continue;
    }

    const { totalScore, grade, gradePoint, remark } = calculateGrade(
      row.caScore,
      row.examScore,
    );

    validRows.push({
      rowNumber: row.rowNumber,
      studentId: student.id,
      matricNumber: student.matricnumber,
      studentName: `${student.firstname} ${student.lastname}`,
      caScore: row.caScore,
      examScore: row.examScore,
      totalScore,
      grade,
      gradePoint,
      remark,
    });
  }

  return {
    academic: {
      session: academic.session,
      semester: academic.semester,
      department: academic.department,
      level: academic.level,
      course: academic.course,
    },

    summary: {
      totalRows: rows.length,
      validRows: validRows.length,
      invalidRows: invalidRows.length,
    },

    validRows,
    invalidRows,
  };
};

export const uploadResults = async ({
  fileBuffer,
  metadata,
  uploadType = "new",
}) => {
  
  const validation = await validateResultUpload({
    fileBuffer,
    metadata,
  });

  if (validation.invalidRows.length > 0) {
    throw apiError(
      400,
      "Upload contains invalid records. Please correct the file before uploading.",
    );
  }

  if (validation.validRows.length === 0) {
    throw apiError(400, "No valid results were found in the uploaded file.");
  }

  const academic = validation.academic;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const row of validation.validRows) {
      await client.query(
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
        `,
        [
          row.studentId,
          academic.course.id,
          academic.session.id,
          academic.semester.id,
          row.caScore,
          row.examScore,
          row.totalScore,
          row.grade,
          row.gradePoint,
          row.remark,
        ],
      );
    }

    await client.query("COMMIT");

    return {
      uploadType,
      academic,
      summary: {
        uploaded: validation.validRows.length,
        failed: 0,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
