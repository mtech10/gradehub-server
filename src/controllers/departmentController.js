import asyncHandler from "../utils/asyncHandler.js";
import * as departmentService from "../services/departmentService.js";

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    data: department,
  });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const result = await departmentService.getDepartments(req.query);

  res.json({
    success: true,
    message: "Departments retrieved successfully",
    data: result.departments,
    pagination: result.pagination,
  });
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);

  res.json({
    success: true,
    data: department,
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(
    req.params.id,
    req.body,
  );

  res.json({
    success: true,
    message: "Department updated successfully",
    data: department,
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id);

  res.json({
    success: true,
    message: "Department deleted successfully",
  });
});

export const deactivateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.deactivateDepartment(
    req.params.id,
  );

  res.json({
    success: true,
    message: "Department deactivated successfully",
    data: department,
  });
});

export const restoreDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.restoreDepartment(req.params.id);

  res.json({
    success: true,
    message: "Department restored successfully",
    data: department,
  });
});

export const getDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await departmentService.getDepartmentStats();

  res.json({
    success: true,
    message: "Department statistics retrieved successfully",
    data: stats,
  });
});
