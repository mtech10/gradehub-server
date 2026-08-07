import bcrypt from "bcrypt";

import pool from "../config/database.js";

import apiError from "../utils/apiError.js";

import checkDuplicate from "../utils/checkDuplicate.js";

import {
  mapStudentProfile,
  mapAdminProfile,
} from "../utils/mappers/profileMapper.js";

export const getStudentProfile = async (studentId) => {
  const result = await pool.query(
    `
    SELECT

      s.id AS student_id,
      s.matricnumber,
      s.firstname,
      s.middlename,
      s.lastname,
      s.gender,
      s.phone,
      s.photo,
      s.admissionyear,

      u.email,

      d.id AS department_id,
      d.name AS department_name,

      f.id AS faculty_id,
      f.name AS faculty_name,

      l.id AS level_id,
      l.name AS level_name,

      ses.id AS session_id,
      ses.name AS session_name

    FROM students s

    JOIN users u
      ON u.studentid = s.id

    JOIN departments d
      ON s.departmentid = d.id

    JOIN faculties f
      ON d.facultyid = f.id

    JOIN levels l
      ON s.levelid = l.id

    JOIN sessions ses
      ON s.sessionid = ses.id

    WHERE s.id = $1
      AND s.isactive = true
    `,
    [studentId],
  );

  if (!result.rows.length) {
    throw apiError(404, "Student not found");
  }

  return mapStudentProfile(result.rows[0]);
};

export const getAdminProfile = async (userId) => {
  const result = await pool.query(
    `
    SELECT

      a.id AS admin_id,

      a.employeeid,
      a.firstname,
      a.lastname,

      a.department,
      a.position,
      a.office,

      a.phone,
      a.photo,

      a.lastlogin,
      a.isactive,

      u.email

    FROM admins a

    JOIN users u
      ON a.userid = u.id

    WHERE a.userid = $1
    `,
    [userId],
  );

  if (!result.rows.length) {
    throw apiError(404, "Admin not found");
  }

  return mapAdminProfile(result.rows[0]);
};

export const updateStudentProfile = async (studentId, data) => {
  const profile = await getStudentProfile(studentId);

  await pool.query(
    `
    UPDATE students
    SET
      firstname = $1,
      middlename = $2,
      lastname = $3,
      phone = $4,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $5
    `,
    [
      data.firstName ?? profile.firstName,
      data.middleName ?? profile.middleName,
      data.lastName ?? profile.lastName,
      data.phone ?? profile.phone,
      studentId,
    ],
  );

  return getStudentProfile(studentId);
};

export const updateAdminProfile = async (userId, data) => {
  const profile = await getAdminProfile(userId);

  await pool.query(
    `
    UPDATE admins
    SET
      firstname = $1,
      lastname = $2,
      department = $3,
      position = $4,
      office = $5,
      phone = $6,
      updatedat = CURRENT_TIMESTAMP
    WHERE userid = $7
    `,
    [
      data.firstName ?? profile.firstName,
      data.lastName ?? profile.lastName,
      data.department ?? profile.department,
      data.position ?? profile.position,
      data.office ?? profile.office,
      data.phone ?? profile.phone,
      userId,
    ],
  );

  return getAdminProfile(userId);
};

export const updateStudentPhoto = async (studentId, photo) => {
  await pool.query(
    `
    UPDATE students
    SET
      photo = $1,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $2
    `,
    [photo, studentId],
  );

  return getStudentProfile(studentId);
};

export const updateEmail = async (userId, email) => {
  await checkDuplicate({
    table: "users",
    conditions: {
      email,
    },
    excludeId: userId,
    message: "Email already exists",
  });

  await pool.query(
    `
    UPDATE users
    SET
      email = $1,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $2
    `,
    [email, userId],
  );
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const result = await pool.query(
    `
    SELECT password
    FROM users
    WHERE id = $1
    `,
    [userId],
  );

  const user = result.rows[0];

  if (!user) {
    throw apiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw apiError(400, "Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `
    UPDATE users
    SET
      password = $1,
      updatedat = CURRENT_TIMESTAMP
    WHERE id = $2
    `,
    [hashedPassword, userId],
  );

  return {
    message: "Password changed successfully",
  };
};
