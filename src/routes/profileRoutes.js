import express from "express";

import * as profileController from "../controllers/profileController.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";

import {
  updateStudentProfileValidator,
  updateAdminProfileValidator,
  updateEmailValidator,
  changePasswordValidator,
  updatePhotoValidator,
} from "../validators/profileValidator.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/student",
  authorize("student"),
  profileController.getStudentProfile,
);

router.put(
  "/student",
  authorize("student"),
  updateStudentProfileValidator,
  validate,
  profileController.updateStudentProfile,
);

router.patch(
  "/student/photo",
  authorize("student"),
  updatePhotoValidator,
  validate,
  profileController.updateStudentPhoto,
);

router.get("/admin", authorize("admin"), profileController.getAdminProfile);

router.put(
  "/admin",
  authorize("admin"),
  updateAdminProfileValidator,
  validate,
  profileController.updateAdminProfile,
);

router.patch(
  "/email",
  updateEmailValidator,
  validate,
  profileController.updateEmail,
);

router.patch(
  "/password",
  changePasswordValidator,
  validate,
  profileController.changePassword,
);

export default router;
