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

    let result = await pool.query(
      `SELECT id, email, role, studentid, isactive FROM users WHERE id = $1`,
      [decoded.id],
    );

    let user;

    if (result.rows.length === 0) {
      const studentResult = await pool.query(
        `SELECT id, email, isactive FROM students WHERE id = $1`,
        [decoded.id],
      );

      if (studentResult.rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }

      user = {
        ...studentResult.rows[0],
        role: "student",

        studentid: studentResult.rows[0].id,
      };
    } else {
      user = result.rows[0];
    }

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
