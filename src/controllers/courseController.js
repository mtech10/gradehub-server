import * as courseService from "../services/courseService.js";
import pool from "../config/database.js";
import { response } from "../utils/response.js";
import xlsx from "xlsx";
import { notifyAdmins } from "../services/notificationService.js";

export const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body);

    // Notify admins of the new course addition
    await notifyAdmins({
      title: "New Course Added",
      message: `The course ${course.code || req.body.code} - ${course.title || req.body.title} has been created.`,
      category: "system",
    });

    return response(res, course, "Course created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const { courses, pagination } = await courseService.getCourses(req.query);

    return response(
      res,
      courses,
      "Courses retrieved successfully",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);

    return response(res, course, "Course retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);

    return response(res, course, "Course updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deactivateCourse = async (req, res, next) => {
  try {
    const course = await courseService.deactivateCourse(req.params.id);

    // Notify admins that a course was deactivated
    await notifyAdmins({
      title: "Course Deactivated",
      message: `A course record has been deactivated and suspended from active status.`,
      category: "alert",
    });

    return response(res, course, "Course deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const restoreCourse = async (req, res, next) => {
  try {
    const course = await courseService.restoreCourse(req.params.id);

    return response(res, course, "Course restored successfully");
  } catch (error) {
    next(error);
  }
};

export const getCourseStatistics = async (req, res, next) => {
  try {
    const statistics = await courseService.getCourseStatistics();

    return response(
      res,
      statistics,
      "Course statistics retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const uploadBulkCourses = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  // Grab the global departmentId and levelId selected from the modal dropdowns
  const { departmentId, levelId } = req.body;

  if (!departmentId || !levelId) {
    return res.status(400).json({
      message: "Please select both a Department and a Level before uploading.",
    });
  }

  const client = await pool.connect();

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rawData.length === 0) {
      return res.status(400).json({ message: "The uploaded file is empty." });
    }

    let successCount = 0;

    // Start database transaction
    await client.query("BEGIN");

    for (const row of rawData) {
      // Map these to your simplified course CSV template columns
      // (e.g., "Course Code", "Course Title", "Credit Unit", "Semester")
      const code = row["Course Code"];
      const title = row["Course Title"];
      const creditunit = row["Credit Unit"] || row["Units"] || 3;
      const semester = row["Semester"];

      // Skip rows missing critical identifiers
      if (!code || !title) continue;

      const insertQuery = `
        INSERT INTO courses 
          (code, title, creditunit, semester, departmentid, levelid) 
        VALUES 
          ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (code) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          creditunit = EXCLUDED.creditunit,
          semester = EXCLUDED.semester,
          departmentid = EXCLUDED.departmentid,
          levelid = EXCLUDED.levelid
        RETURNING id;
      `;

      await client.query(insertQuery, [
        code,
        title,
        creditunit,
        semester || null,
        departmentId,
        levelId,
      ]);

      successCount++;
    }

    // Commit transaction
    await client.query("COMMIT");

    // Notify admins of the bulk course upload success
    await notifyAdmins({
      title: "Bulk Courses Uploaded",
      message: `Successfully processed and imported ${successCount} courses via Excel upload.`,
      category: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Bulk course upload successful.",
      count: successCount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Course bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process the uploaded file.",
    });
  } finally {
    client.release();
  }
};
