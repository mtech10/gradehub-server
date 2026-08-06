import pool from "../config/database.js";

import { buildPagination } from "../utils/pagination.js";

import mapLevel from "../utils/mappers/levelMapper.js";

import checkDuplicate from "../utils/checkDuplicate.js";
import apiError from "../utils/apiError.js";

import softDelete from "../utils/softDelete.js";
import restoreEntity from "../utils/restoreEntity.js";

export const createLevel = async (data) => {
  const { name, description } = data;

  await checkDuplicate({
    table: "levels",
    conditions: {
      name,
    },
    message: "Level already exists",
  });

  const result = await pool.query(
    `
    INSERT INTO levels
    (
      name,
      description
    )
    VALUES ($1,$2)
    RETURNING id
    `,
    [name, description],
  );

  return getLevelById(result.rows[0].id);
};

export const getLevels = async (filters) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "active",
    sort = "name",
    order = "asc",
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "";
  const values = [];
  let index = 1;

  if (status === "active") {
    whereClause += ` WHERE isactive = true`;
  } else if (status === "inactive") {
    whereClause += ` WHERE isactive = false`;
  }

  if (search) {
    const searchClause = `
      (
        name ILIKE $${index}
      )
    `;

    values.push(`%${search}%`);

    whereClause += whereClause
      ? ` AND ${searchClause}`
      : ` WHERE ${searchClause}`;

    index++;
  }

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM levels
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);

  const total = Number(countResult.rows[0].total);

  const allowedSortFields = ["name", "createdat", "updatedat"];

  const sortBy = allowedSortFields.includes(sort) ? sort : "name";

  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  values.push(limit);
  values.push(offset);

  const query = `
    SELECT *
    FROM levels

    ${whereClause}

    ORDER BY ${sortBy} ${sortOrder}

    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const result = await pool.query(query, values);

  return {
    levels: result.rows.map(mapLevel),
    pagination: buildPagination(page, limit, total),
  };
};

export const getLevelById = async (id) => {
  const exists = await pool.query(
    `
    SELECT id
    FROM levels
    WHERE id = $1
  `,
    [id],
  );

  if (exists.rows.length === 0) {
    throw apiError(404, "Level not found");
  }
  const result = await pool.query(
    `
    SELECT *
    FROM levels
    WHERE id = $1
    `,
    [id],
  );

  return mapLevel(result.rows[0]);
};

export const updateLevel = async (id, data) => {
  const exists = await pool.query(
    `
    SELECT id
    FROM levels
    WHERE id = $1
  `,
    [id],
  );

  if (exists.rows.length === 0) {
    throw apiError(404, "Level not found");
  }
  const current = await getLevelById(id);

  const updated = {
    ...current,
    ...data,
  };

  await checkDuplicate({
    table: "levels",
    conditions: {
      name: updated.name,
    },
    excludeId: id,
    message: "Level already exists",
  });

  await pool.query(
    `
    UPDATE levels
    SET
      name = $1,
      description = $2,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $3
    `,
    [updated.name, updated.description, id],
  );

  return getLevelById(id);
};

export const deactivateLevel = async (id) => {
  await softDelete("levels", id, "Level not found");

  return getLevelById(id);
};

export const restoreLevel = async (id) => {
  await restoreEntity("levels", id, "Level not found");

  return getLevelById(id);
};
