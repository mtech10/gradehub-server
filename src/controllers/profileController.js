import * as profileService from "../services/profileService.js";
import { createNotification } from "../services/notificationService.js";

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

    await createNotification({
      userId: req.user.id,
      title: "Profile Updated",
      message:
        "Your student profile information has been successfully updated.",
      category: "system",
    });

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

    await createNotification({
      userId: req.user.id,
      title: "Profile Updated",
      message:
        "Your administrator profile information has been successfully updated.",
      category: "system",
    });

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

    await createNotification({
      userId: req.user.id,
      title: "Email Address Changed",
      message:
        "The email address associated with your account was recently updated.",
      category: "alert",
    });

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

    await createNotification({
      userId: req.user.id,
      title: "Password Changed",
      message:
        "Your account password was successfully changed. If you did not do this, please contact support immediately.",
      category: "alert",
    });

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

    await createNotification({
      userId: req.user.id,
      title: "Profile Photo Updated",
      message: "Your profile picture has been updated successfully.",
      category: "system",
    });

    res.json({
      success: true,
      message: "Photo updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
