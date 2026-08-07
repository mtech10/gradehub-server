import * as profileService from "../services/profileService.js";

export const getStudentProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getStudentProfile(req.user.studentid);

    res.json({
      success: true,
      message: "Student profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getAdminProfile(req.user.id);

    res.json({
      success: true,
      message: "Admin profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateStudentProfile(
      req.user.studentid,
      req.body,
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateAdminProfile(
      req.user.id,
      req.body,
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmail = async (req, res, next) => {
  try {
    await profileService.updateEmail(req.user.id, req.body.email);

    res.json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await profileService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentPhoto = async (req, res, next) => {
  try {
    const profile = await profileService.updateStudentPhoto(
      req.user.studentid,
      req.body.photo,
    );

    res.json({
      success: true,
      message: "Photo updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
