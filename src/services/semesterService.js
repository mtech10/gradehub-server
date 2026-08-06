import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import { buildPagination } from "../utils/pagination.js";
import { mapSemester } from "../utils/mappers/semesterMapper.js";

import checkDuplicate from "../utils/checkDuplicate.js";
import ensureActive from "../utils/ensureActive.js";
import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createSemester = async (data) => {
  const { sessionId, name, startDate, endDate } = data;

  await ensureActive({
    table: "sessions",
    id: sessionId,
    message: "Session not found",
  });

  await checkDuplicate({
    table: "semesters",
    conditions: {
      sessionid: sessionId,
      name,
    },
    message: "Semester already exists for this session",
  });

  const result = await pool.query(
    `
    INSERT INTO semesters
    (
      sessionid,
      name,
      startdate,
      enddate
    )
    VALUES ($1,$2,$3,$4)
    RETURNING id
    `,
    [sessionId, name, startDate, endDate],
  );

  return await getSemesterById(result.rows[0].id);
};

export const getSemesters = async (filters) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "active",
    sessionId,
    sort = "startdate",
    order = "desc",
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "";
  const values = [];
  let index = 1;

  if (status === "active") {
    whereClause += " WHERE sem.isactive = true";
  } else if (status === "inactive") {
    whereClause += " WHERE sem.isactive = false";
  }

  if (sessionId) {
    whereClause += whereClause
      ? ` AND sem.sessionid = $${index}`
      : ` WHERE sem.sessionid = $${index}`;

    values.push(sessionId);
    index++;
  }

  if (search) {
    const searchClause = `
      (
        sem.name ILIKE $${index}
        OR ses.name ILIKE $${index}
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
    FROM semesters sem
    JOIN sessions ses
      ON sem.sessionid = ses.id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].total);

  const allowedSort = ["name", "startdate", "enddate", "createdat"];

  const sortBy = allowedSort.includes(sort) ? sort : "startdate";
  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  values.push(limit);
  values.push(offset);

  const query = `
    SELECT
      sem.id,
      sem.name,
      sem.startdate,
      sem.enddate,
      sem.iscurrent,
      sem.isactive,
      sem.createdat,
      sem.updatedat,

      ses.id   AS session_id,
      ses.name AS session_name

    FROM semesters sem

    JOIN sessions ses
      ON sem.sessionid = ses.id

    ${whereClause}

    ORDER BY sem.${sortBy} ${sortOrder}

    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const result = await pool.query(query, values);

  return {
    semesters: result.rows.map(mapSemester),
    pagination: buildPagination(page, limit, total),
  };
};

export const getSemesterById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      sem.id,
      sem.name,
      sem.startdate,
      sem.enddate,
      sem.iscurrent,
      sem.isactive,
      sem.createdat,
      sem.updatedat,

      ses.id   AS session_id,
      ses.name AS session_name

    FROM semesters sem

    JOIN sessions ses
      ON sem.sessionid = ses.id

    WHERE sem.id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, "Semester not found");
  }

  return mapSemester(result.rows[0]);
};

export const updateSemester = async (id, data) => {
  const { sessionId, name, startDate, endDate } = data;

  await ensureActive({
    table: "semesters",
    id,
    message: "Semester not found",
  });
  await ensureActive({
    table: "sessions",
    id: sessionId,
    message: "Session not found",
  });

  await checkDuplicate({
    table: "semesters",
    conditions: {
      sessionid: sessionId,
      name,
    },
    excludeId: id,
    message: "Semester already exists for this session",
  });

  await pool.query(
    `
    UPDATE semesters
    SET
      sessionid = $1,
      name = $2,
      startdate = $3,
      enddate = $4,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $5
    `,
    [sessionId, name, startDate, endDate, id],
  );

  return await getSemesterById(id);
};

export const setCurrentSemester = async (id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await ensureActive({
      table: "semesters",
      id,
      message: "Semester not found",
    });
    const semester = await client.query(
      `
  SELECT sessionid
  FROM semesters
  WHERE id = $1
  `,
      [id],
    );

    if (!semester.rows.length) {
      throw apiError(404, "Semester not found");
    }

    const { sessionid: sessionId } = semester.rows[0];
    await client.query(
      `
      UPDATE semesters
      SET iscurrent = false
      WHERE sessionid = $1
      `,
      [sessionId],
    );

    await client.query(
      `
      UPDATE semesters
      SET
        iscurrent = true,
        updatedat = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [id],
    );

    await client.query("COMMIT");

    return await getSemesterById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deactivateSemester = async (id) => {
  const semester = await softDelete("semesters", id, "Semester not found");

  return mapSemester(semester);
};

export const restoreSemester = async (id) => {
  const semester = await restoreEntity("semesters", id, "Semester not found");

  return mapSemester(semester);
};
