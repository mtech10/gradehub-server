import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import { buildPagination } from "../utils/pagination.js";
import { mapSession } from "../utils/mappers/sessionMapper.js";
import checkDuplicate from "../utils/checkDuplicate.js";
import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createSession = async (data) => {
  const { name, startdate, enddate } = data;

  await checkDuplicate({
    table: "sessions",
    conditions: { name },
    message: "Session already exists",
  });

  const result = await pool.query(
    `
    INSERT INTO sessions (name, startdate, enddate, iscurrent)
    VALUES ($1, $2, $3, false)
    RETURNING *
    `,
    [name, startdate, enddate],
  );

  return mapSession(result.rows[0]);
};

export const getSessions = async (filters) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "active",
    sort = "startdate",
    order = "desc",
  } = filters;

  const offset = (page - 1) * limit;
  let whereClause = "";
  const values = [];
  let index = 1;

  if (status === "active") {
    whereClause += " WHERE isactive = true";
  } else if (status === "inactive") {
    whereClause += " WHERE isactive = false";
  }

  if (search) {
    const searchClause = `name ILIKE $${index}`;
    values.push(`%${search}%`);
    whereClause += whereClause
      ? ` AND ${searchClause}`
      : ` WHERE ${searchClause}`;
    index++;
  }

  const countQuery = `SELECT COUNT(*) AS total FROM sessions ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].total);

  const allowedSortFields = ["name", "startdate", "enddate", "createdat"];
  const sortBy = allowedSortFields.includes(sort) ? sort : "startdate";
  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  values.push(limit);
  values.push(offset);

  const query = `
    SELECT * FROM sessions
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${index} OFFSET $${index + 1}
  `;

  const result = await pool.query(query, values);

  return {
    sessions: result.rows.map(mapSession),
    pagination: buildPagination(page, limit, total),
  };
};

export const getSessionById = async (id) => {
  const result = await pool.query(`SELECT * FROM sessions WHERE id = $1`, [id]);
  if (result.rows.length === 0) {
    throw apiError(404, "Session not found");
  }
  return mapSession(result.rows[0]);
};

// --- RESTORED BACKEND SQL FOR EDITING ---
export const updateSession = async (id, data) => {
  const session = await getSessionById(id);
  const updated = { ...session, ...data };

  await checkDuplicate({
    table: "sessions",
    conditions: { name: updated.name },
    excludeId: id,
    message: "Session already exists",
  });

  const result = await pool.query(
    `
    UPDATE sessions
    SET name = $1, startdate = $2, enddate = $3, updatedat = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [updated.name, updated.startdate, updated.enddate, id],
  );

  return mapSession(result.rows[0]);
};

// --- FIXED "GHOSTING" BUG ---
export const setCurrentSession = async (id) => {
  const session = await getSessionById(id);

  if (!session.isActive) {
    throw apiError(404, "Session not found");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Wipe the current status from ALL sessions
    await client.query(`UPDATE sessions SET iscurrent = false`);

    // 2. Wipe the current status from ALL semesters globally (This kills the ghost!)
    await client.query(`UPDATE semesters SET iscurrent = false`);

    // 3. Set the new active session
    const result = await client.query(
      `
      UPDATE sessions
      SET iscurrent = true, updatedat = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id],
    );

    await client.query("COMMIT");
    return mapSession(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deactivateSession = async (id) => {
  const session = await softDelete("sessions", id, "Session not found");
  return mapSession(session);
};

export const restoreSession = async (id) => {
  const session = await restoreEntity("sessions", id, "Session not found");
  return mapSession(session);
};

export const runSessionPromotion = async (sessionId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get all active students
    const studentsResult = await client.query(
      `SELECT id, departmentid, levelid FROM students WHERE isactive = true`,
    );
    const students = studentsResult.rows;

    // 2. Get all promotion rules mapping
    const rulesResult = await client.query(
      `SELECT departmentid, current_levelid, next_levelid, min_cgpa, min_earned_units FROM promotion_rules`,
    );
    const rules = rulesResult.rows;

    let promotedCount = 0;
    let retainedCount = 0;

    // 3. Evaluate each student
    for (const student of students) {
      // Find the specific rule for this student's department and current level
      const rule = rules.find(
        (r) =>
          r.departmentid === student.departmentid &&
          r.current_levelid === student.levelid,
      );

      // If no rule exists, skip them
      if (!rule) continue;

      // Check if this student was already promoted for this session to prevent infinite promotion
      const alreadyPromotedResult = await client.query(
        `SELECT id FROM promotion_history WHERE studentid = $1 AND sessionid = $2`,
        [student.id, sessionId],
      );

      if (alreadyPromotedResult.rows.length > 0) {
        continue;
      }

      // Fetch student's academic standing
      const performanceResult = await client.query(
        `
        SELECT 
          COALESCE(SUM(CASE WHEN r.grade IS NOT NULL AND UPPER(r.grade) != 'F' THEN c.creditunit ELSE 0 END), 0) AS total_earned_units,
          COALESCE(SUM(c.creditunit), 0) AS total_registered_units,
          COALESCE(SUM(
            c.creditunit * CASE UPPER(COALESCE(r.grade, 'F'))
              WHEN 'A' THEN 5.0
              WHEN 'B' THEN 4.0
              WHEN 'C' THEN 3.0
              WHEN 'D' THEN 2.0
              WHEN 'E' THEN 1.0
              ELSE 0.0
            END
          ), 0) AS total_grade_points
        FROM course_registrations cr
        JOIN courses c ON cr.courseid = c.id
        LEFT JOIN results r ON r.courseid = cr.courseid AND r.studentid = cr.studentid AND r.sessionid = cr.sessionid
        WHERE cr.studentid = $1 
          AND cr.sessionid = $2 
          AND cr.isactive = true
        `,
        [student.id, sessionId],
      );

      const performance = performanceResult.rows[0];
      const earnedUnits = Number(performance.total_earned_units);
      const registeredUnits = Number(performance.total_registered_units);
      const totalGradePoints = Number(performance.total_grade_points);
      const cgpa = registeredUnits > 0 ? totalGradePoints / registeredUnits : 0;

      // 4. Evaluate against the department's rule
      if (
        cgpa >= Number(rule.min_cgpa) &&
        earnedUnits >= Number(rule.min_earned_units)
      ) {
        // PASS: Update student level
        await client.query(
          `UPDATE students SET levelid = $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
          [rule.next_levelid, student.id],
        );

        // PASS: Record in history
        await client.query(
          `INSERT INTO promotion_history (studentid, sessionid, oldlevelid, newlevelid) VALUES ($1, $2, $3, $4)`,
          [student.id, sessionId, student.levelid, rule.next_levelid],
        );

        promotedCount++;
      } else {
        // FAIL: Retain student
        retainedCount++;
      }
    }

    await client.query("COMMIT");

    return {
      message: "Batch promotion completed successfully.",
      stats: {
        totalEvaluated: students.length,
        promoted: promotedCount,
        retained: retainedCount,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Promotion Engine Error:", error);
    throw apiError(500, "Failed to execute session promotion.");
  } finally {
    client.release();
  }
};

export const savePromotionRule = async (data) => {
  const {
    departmentid,
    current_levelid,
    next_levelid,
    min_cgpa,
    min_earned_units,
  } = data;

  const query = `
    INSERT INTO promotion_rules (departmentid, current_levelid, next_levelid, min_cgpa, min_earned_units)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (departmentid, current_levelid) 
    DO UPDATE SET 
      next_levelid = EXCLUDED.next_levelid,
      min_cgpa = EXCLUDED.min_cgpa,
      min_earned_units = EXCLUDED.min_earned_units,
      updatedat = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const result = await pool.query(query, [
    departmentid,
    current_levelid,
    next_levelid,
    min_cgpa,
    min_earned_units,
  ]);
  return result.rows[0];
};

export const getPromotionRules = async () => {
  const result = await pool.query(`
    SELECT pr.*, d.name as department_name, l1.name as current_level_name, l2.name as next_level_name
    FROM promotion_rules pr
    JOIN departments d ON pr.departmentid = d.id
    JOIN levels l1 ON pr.current_levelid = l1.id
    JOIN levels l2 ON pr.next_levelid = l2.id
  `);
  return result.rows;
};

export const deletePromotionRule = async (id) => {
  const result = await pool.query(
    `DELETE FROM promotion_rules WHERE id = $1 RETURNING *`,
    [id],
  );

  if (result.rowCount === 0) {
    throw new Error("Promotion rule not found");
  }

  return result.rows[0];
};

export const deletePromotionRulesBatch = async (ids) => {
  const result = await pool.query(
    `DELETE FROM promotion_rules WHERE id = ANY($1::uuid[]) RETURNING id`,
    [ids],
  );
  return result.rows;
};
