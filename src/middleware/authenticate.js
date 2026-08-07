import jwt from "jsonwebtoken";
import pool from "../config/database.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `
  SELECT
      id,
      email,
      role,
      studentid,
      isactive
  FROM users
  WHERE id = $1
  `,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    if (!user.isactive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authenticate;
