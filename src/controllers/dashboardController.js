import * as dashboardService from "../services/dashboardService.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getAdminDashboard();

    res.json({
      success: true,
      message: "Dashboard retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getStudentDashboard(req.user);
    res.json({
      success: true,
      message: "Dashboard retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};
