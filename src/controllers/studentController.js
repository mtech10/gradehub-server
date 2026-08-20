import * as studentService from "../services/studentService.js";
import { response } from "../utils/response.js";
import pool from "../config/database.js";
import xlsx from "xlsx";
import { notifyAdmins } from "../services/notificationService.js";

export const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);

    await notifyAdmins({
      title: "New Student Registered",
      message: `A new student (${req.body.firstname} ${req.body.lastname}) has been manually added to the system.`,
      category: "system",
    });

    return response(res, student, "Student created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const { students, pagination } = await studentService.getStudents(
      req.query,
    );

    return response(
      res,
      students,
      "Students retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, d.name AS department_name, l.name AS level_name 
       FROM students s 
       LEFT JOIN departments d ON s.departmentid = d.id 
       LEFT JOIN levels l ON s.levelid = l.id 
       WHERE s.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);

    return response(res, student, "Student updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivateStudent = async (req, res, next) => {
  try {
    const student = await studentService.deactivateStudent(req.params.id);

    await notifyAdmins({
      title: "Student Account Deactivated",
      message:
        "A student record has been deactivated and suspended from the system.",
      category: "alert",
    });

    return response(res, student, "Student deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const restoreStudent = async (req, res, next) => {
  try {
    const student = await studentService.restoreStudent(req.params.id);

    return response(res, student, "Student restored successfully");
  } catch (error) {
    next(error);
  }
};

export const getStudentStats = async (req, res, next) => {
  try {
    const stats = await studentService.getStudentStats();
    return response(
      res,
      stats,
      "Student statistics retrieved successfully",
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await studentService.deactivateStudent(req.params.id);

    await notifyAdmins({
      title: "Student Account Deleted",
      message: "A student record has been removed from the active system.",
      category: "alert",
    });

    return response(res, student, "Student deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const uploadBulkStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const { departmentId, levelId } = req.body;

  if (!departmentId || !levelId) {
    return res.status(400).json({
      message: "Please select both a Department and a Level before uploading.",
    });
  }

  const client = await pool.connect();

  try {
    const sessionResult = await client.query(
      `SELECT id FROM sessions WHERE isactive = true LIMIT 1`,
    );

    let sessionId = sessionResult.rows[0]?.id;
    if (!sessionId) {
      const fallbackSession = await client.query(
        `SELECT id FROM sessions ORDER BY created_at DESC LIMIT 1`,
      );
      sessionId = fallbackSession.rows[0]?.id;
    }

    if (!sessionId) {
      return res.status(400).json({
        message: "No academic session found. Please create a session first.",
      });
    }
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rawData.length === 0) {
      return res.status(400).json({ message: "The uploaded file is empty." });
    }

    let successCount = 0;
    await client.query("BEGIN");
    const currentYear = new Date().getFullYear();

    for (const row of rawData) {
      const firstname = row["First Name"];
      const lastname = row["Last Name"];
      const matricnumber = row["Matric Number"];
      const email = row["Email"];

      if (!firstname || !lastname || !matricnumber) continue;

      const insertQuery = `
        INSERT INTO students 
          (firstname, lastname, matricnumber, email, departmentid, levelid, sessionid, admissionyear) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (matricnumber) 
        DO UPDATE SET 
          firstname = EXCLUDED.firstname,
          lastname = EXCLUDED.lastname,
          email = EXCLUDED.email,
          departmentid = EXCLUDED.departmentid,
          levelid = EXCLUDED.levelid,
          sessionid = EXCLUDED.sessionid
        RETURNING id;
      `;

      await client.query(insertQuery, [
        firstname,
        lastname,
        matricnumber,
        email || null,
        departmentId,
        levelId,
        sessionId,
        currentYear,
      ]);
      successCount++;
    }

    await client.query("COMMIT");

    await notifyAdmins({
      title: "Bulk Students Uploaded",
      message: `Successfully processed and registered ${successCount} students via Excel upload.`,
      category: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Bulk upload successful.",
      count: successCount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Student bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process the uploaded file.",
    });
  } finally {
    client.release();
  }
};
