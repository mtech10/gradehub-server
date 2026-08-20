import asyncHandler from "../utils/asyncHandler.js";
import * as authService from "../services/authService.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const registerAdmin = asyncHandler(async (req, res) => {
  const result = await authService.registerAdmin(req.body);

  res.status(201).json({
    success: true,
    message: "Administrator created successfully",
    data: result,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const adminId = req.user.id;

  const result = await pool.query(
    "SELECT id, firstname, lastname, email, phone, role FROM admins WHERE id = $1",
    [adminId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  res.status(200).json({ success: true, data: result.rows[0] });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { firstname, lastname, phone } = req.body;

  const result = await pool.query(
    `UPDATE admins 
     SET firstname = $1, lastname = $2, phone = $3, updatedat = CURRENT_TIMESTAMP 
     WHERE id = $4 RETURNING id, firstname, lastname, email, phone, role`,
    [firstname, lastname, phone, adminId],
  );

  res.status(200).json({
    success: true,
    data: result.rows[0],
    message: "Profile updated successfully",
  });
});
