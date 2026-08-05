import bcrypt from "bcrypt";
import pool from "../config/database.js";
import generateToken from "../utils/generateToken.js";
import apiError from "../utils/apiError.js";

export const registerAdmin = async (data) => {
  const { firstName, lastName, email, password, department, position, phone } =
    data;

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new ApiError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userResult = await pool.query(
    `
    INSERT INTO users (email, password, role)
    VALUES ($1, $2, 'admin')
    RETURNING id, email, role
    `,
    [email, hashedPassword],
  );

  const user = userResult.rows[0];

  await pool.query(
    `
    INSERT INTO admins
    (
      userId,
      firstName,
      lastName,
      department,
      position,
      phone
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [user.id, firstName, lastName, department, position, phone],
  );

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    token,
    user,
  };
};

export const login = async (email, password) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, "Invalid email or password");
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isactive) {
    throw new ApiError(403, "Account has been deactivated");
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};
