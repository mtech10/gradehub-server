import * as facultyService from "../services/facultyService.js";

export const createFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.createFaculty(req.body);

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

export const getFaculties = async (req, res, next) => {
  try {
    const faculties = await facultyService.getFaculties();

    res.status(200).json({
      success: true,
      data: faculties,
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await facultyService.getFacultyById(req.params.id);

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.updateFaculty(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateFaculty = async (req, res, next) => {
  try {
    await facultyService.deactivateFaculty(req.params.id);

    res.status(200).json({
      success: true,
      message: "Faculty deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const restoreFaculty = async (req, res, next) => {
  try {
    await facultyService.restoreFaculty(req.params.id);

    res.status(200).json({
      success: true,
      message: "Faculty restored successfully",
    });
  } catch (error) {
    next(error);
  }
};
