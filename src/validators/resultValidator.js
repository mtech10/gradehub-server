import { body } from "express-validator";

export const createResultValidator = [
  body("studentId")
    .notEmpty()
    .withMessage("Student is required")
    .isUUID()
    .withMessage("Invalid Student ID"),

  body("courseId")
    .notEmpty()
    .withMessage("Course is required")
    .isUUID()
    .withMessage("Invalid Course ID"),

  body("sessionId")
    .notEmpty()
    .withMessage("Session is required")
    .isUUID()
    .withMessage("Invalid Session ID"),

  body("semesterId")
    .notEmpty()
    .withMessage("Semester is required")
    .isUUID()
    .withMessage("Invalid Semester ID"),

  body("caScore")
    .notEmpty()
    .withMessage("CA Score is required")
    .isFloat({ min: 0, max: 30 })
    .withMessage("CA Score must be between 0 and 30"),

  body("examScore")
    .notEmpty()
    .withMessage("Exam Score is required")
    .isFloat({ min: 0, max: 70 })
    .withMessage("Exam Score must be between 0 and 70"),
];

export const updateResultValidator = [
  body("studentId").optional().isUUID().withMessage("Invalid Student ID"),

  body("courseId").optional().isUUID().withMessage("Invalid Course ID"),

  body("sessionId").optional().isUUID().withMessage("Invalid Session ID"),

  body("semesterId").optional().isUUID().withMessage("Invalid Semester ID"),

  body("caScore")
    .optional()
    .isFloat({ min: 0, max: 30 })
    .withMessage("CA Score must be between 0 and 30"),

  body("examScore")
    .optional()
    .isFloat({ min: 0, max: 70 })
    .withMessage("Exam Score must be between 0 and 70"),
];

export const validateResultUpload = async ({ fileBuffer, metadata }) => {
  const rows = parseResultExcel(fileBuffer);

  const academic = await findAcademicDetails(metadata);

  const validRows = [];
  const warnings = [];
  const errors = [];

  for (const row of rows) {
    const rowErrors = [];

    if (!row.matricNumber) {
      rowErrors.push("Matric Number is required");
    }

    if (!Number.isFinite(row.caScore) || row.caScore < 0 || row.caScore > 30) {
      rowErrors.push("CA Score must be between 0 and 30");
    }

    if (
      !Number.isFinite(row.examScore) ||
      row.examScore < 0 ||
      row.examScore > 70
    ) {
      rowErrors.push("Exam Score must be between 0 and 70");
    }

    if (rowErrors.length) {
      errors.push({
        row: row.rowNumber,
        matricNumber: row.matricNumber,
        errors: rowErrors,
      });

      continue;
    }

    const studentResult = await pool.query(
      `
      SELECT id, matricnumber, firstname, lastname
      FROM students
      WHERE matricnumber = $1
        AND isactive = true
      LIMIT 1
      `,
      [row.matricNumber],
    );

    if (!studentResult.rows.length) {
      errors.push({
        row: row.rowNumber,
        matricNumber: row.matricNumber,
        errors: ["Student matric number does not exist"],
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
      errors.push({
        row: row.rowNumber,
        matricNumber: row.matricNumber,
        errors: [
          "Student is not registered for this course in the selected session and semester",
        ],
      });

      continue;
    }

    const existingResult = await pool.query(
      `
      SELECT id, isapproved
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
      warnings.push({
        row: row.rowNumber,
        matricNumber: row.matricNumber,
        message: existingResult.rows[0].isapproved
          ? "An approved result already exists"
          : "A result already exists",
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
      courseId: academic.course.id,
      sessionId: academic.session.id,
      semesterId: academic.semester.id,
      caScore: row.caScore,
      examScore: row.examScore,
      totalScore,
      grade,
      gradePoint,
      remark,
    });
  }

  return {
    academic,
    studentsFound: validRows.length + warnings.length,
    validRecords: validRows.length,
    warnings: warnings.length,
    errors: errors.length,
    rows: validRows,
    warningRows: warnings,
    errorRows: errors,
    readyToUpload: validRows.length > 0 && errors.length === 0,
  };
};

export const uploadResults = async ({ fileBuffer, metadata, uploadType }) => {
  const validation = await validateResultUpload({
    fileBuffer,
    metadata,
  });

  if (validation.errors.length > 0) {
    throw apiError(
      400,
      "Upload contains invalid records. Please correct the file before uploading.",
    );
  }

  if (!validation.rows.length) {
    throw apiError(400, "No valid records are available for upload.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertedResults = [];

    for (const row of validation.rows) {
      const result = await client.query(
        `
        INSERT INTO results (
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
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        RETURNING id
        `,
        [
          row.studentId,
          row.courseId,
          row.sessionId,
          row.semesterId,
          row.caScore,
          row.examScore,
          row.totalScore,
          row.grade,
          row.gradePoint,
          row.remark,
        ],
      );

      insertedResults.push(result.rows[0].id);
    }

    await client.query("COMMIT");

    return {
      uploaded: insertedResults.length,
      uploadType,
      course: validation.academic.course.code,
      session: validation.academic.session.name,
      semester: validation.academic.semester.name,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
