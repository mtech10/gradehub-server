import * as authService from "../services/authService.js";

export const registerAdmin = async (req, res, next) => {
  try {
    const result = await authService.registerAdmin(req.body);

    res.status(201).json({
      success: true,
      message: "Administrator created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
