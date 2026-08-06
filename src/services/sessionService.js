import pool from "../config/database.js";
import apiError from "../utils/apiError.js";
import { buildPagination } from "../utils/pagination.js";
import { mapSession } from "../utils/mappers/sessionMapper.js";
import entityExists from "../utils/entityExists.js";
import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createSession = async (data) => {
  const { name, startdate, enddate } = data;

  const existing = await pool.query(
    `
    SELECT id
    FROM sessions
    WHERE name = $1
    `,
    [name],
  );

  if (existing.rows.length > 0) {
    throw apiError(409, "Session already exists");
  }

  const result = await pool.query(
    `
    INSERT INTO sessions
    (
      name,
      startdate,
      enddate
    )
    VALUES ($1,$2,$3)
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

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM sessions
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].total);

  const allowedSortFields = ["name", "startdate", "enddate", "createdat"];

  const sortBy = allowedSortFields.includes(sort) ? sort : "startdate";

  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  values.push(limit);
  values.push(offset);

  const query = `
    SELECT *
    FROM sessions

    ${whereClause}

    ORDER BY ${sortBy} ${sortOrder}

    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const result = await pool.query(query, values);

  return {
    sessions: result.rows.map(mapSession),
    pagination: buildPagination(page, limit, total),
  };
};

export const getSessionById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM sessions
    WHERE id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw apiError(404, "Session not found");
  }

  return mapSession(result.rows[0]);
};

export const updateSession = async (id, data) => {
  const session = await getSessionById(id);

  const updated = {
    ...session,
    ...data,
  };

  const result = await pool.query(
    `
    UPDATE sessions
    SET
      name = $1,
      startdate = $2,
      enddate = $3,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [updated.name, updated.startdate, updated.enddate, id],
  );

  return mapSession(result.rows[0]);
};

export const setCurrentSession = async (id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify the session exists
    await entityExists("sessions", id, "Session not found", false);

    await client.query(`
      UPDATE sessions
      SET iscurrent = false
    `);

    const result = await client.query(
      `
      UPDATE sessions
      SET
        iscurrent = true,
        updatedat = CURRENT_TIMESTAMP
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
