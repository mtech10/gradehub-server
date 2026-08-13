import bcrypt from "bcrypt";
import pool from "../config/database.js";
import generateToken from "../utils/generateToken.js";
import apiError from "../utils/apiError.js";

export const registerAdmin = async (data) => {
  const { firstName, lastName, email, password, department, position, phone } =
    data;

  const existingUser = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw apiError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userResult = await pool.query(
    `
    INSERT INTO users
    (
      email,
      password,
      role
    )
    VALUES ($1,$2,'admin')
    RETURNING id, email, role
    `,
    [email, hashedPassword],
  );

  const user = userResult.rows[0];

  await pool.query(
    `
    INSERT INTO admins
    (
      userid,
      firstname,
      lastname,
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
  const adminResult = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  if (adminResult.rows.length > 0) {
    const user = adminResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw apiError(401, "Invalid email or password");

    if (!user.isactive) throw apiError(403, "Account has been deactivated");

    const token = generateToken({ id: user.id, role: user.role });

    await pool.query(
      `UPDATE admins SET lastlogin = CURRENT_TIMESTAMP WHERE userid = $1`,
      [user.id],
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  const studentResult = await pool.query(
    `SELECT * FROM students WHERE email = $1`,
    [email],
  );

  if (studentResult.rows.length > 0) {
    const student = studentResult.rows[0];

    if (password !== student.matricnumber) {
      throw apiError(401, "Invalid email or matric number");
    }

    if (!student.isactive)
      throw apiError(403, "Student account has been deactivated");

    const token = generateToken({ id: student.id, role: "student" });

    return {
      token,
      user: {
        id: student.id,
        email: student.email,
        role: "student",
        name: `${student.firstname} ${student.lastname}`,
      },
    };
  }

  throw apiError(401, "Invalid email or password");
};
