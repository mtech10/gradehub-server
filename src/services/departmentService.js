import pool from "../config/database.js";

export const createDepartment = async (data) => {
  const { name, code, faculty, hod, description } = data;

  const existing = await pool.query(
    `
    SELECT id
    FROM departments
    WHERE name = $1
       OR code = $2
    `,
    [name, code],
  );

  if (existing.rows.length > 0) {
    throw new Error("Department already exists");
  }

  const result = await pool.query(
    `
    INSERT INTO departments
    (
      name,
      code,
      faculty,
      hod,
      description
    )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [name, code, faculty, hod, description],
  );

  return result.rows[0];
};

export const getDepartments = async (filters) => {
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

  // Status filter
  if (status === "active") {
    whereClause += ` WHERE "isactive" = true`;
  } else if (status === "inactive") {
    whereClause += ` WHERE "isactive" = false`;
  }

  // Search filter
  if (search) {
    const searchClause = `
      (
        name ILIKE $${index}
        OR code ILIKE $${index}
        OR faculty ILIKE $${index}
        OR hod ILIKE $${index}
      )
    `;

    values.push(`%${search}%`);

    if (whereClause) {
      whereClause += ` AND ${searchClause}`;
    } else {
      whereClause += ` WHERE ${searchClause}`;
    }

    index++;
  }

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM departments
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);

  const total = Number(countResult.rows[0].total);

  values.push(limit);
  values.push(offset);

  const query = `
    SELECT *
    FROM departments
    ${whereClause}
    ORDER BY "${sort}" ${order.toUpperCase()}
    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const result = await pool.query(query, values);

  return {
    departments: result.rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getDepartmentById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM departments
    WHERE id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new Error("Department not found");
  }

  return result.rows[0];
};

export const updateDepartment = async (id, data) => {
  const { name, code, faculty, hod, description } = data;

  const result = await pool.query(
    `
    UPDATE departments
    SET
      name = $1,
      code = $2,
      faculty = $3,
      hod = $4,
      description = $5,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
    `,
    [name, code, faculty, hod, description, id],
  );

  if (result.rows.length === 0) {
    throw new Error("Department not found");
  }

  return result.rows[0];
};
export const deactivateDepartment = async (id) => {
  const result = await pool.query(
    `
    UPDATE departments
    SET
      isactive = false,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new Error("Department not found");
  }

  return result.rows[0];
};

export const restoreDepartment = async (id) => {
  const result = await pool.query(
    `
    UPDATE departments
    SET
      isactive = true,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new Error("Department not found");
  }

  return result.rows[0];
};
