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
