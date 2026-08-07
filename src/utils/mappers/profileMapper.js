const mapStudentProfile = (row) => ({
  id: row.student_id,

  matricNumber: row.matricnumber,

  firstName: row.firstname,
  middleName: row.middlename,
  lastName: row.lastname,

  fullName: [row.firstname, row.middlename, row.lastname]
    .filter(Boolean)
    .join(" "),

  gender: row.gender,

  email: row.email,
  phone: row.phone,

  photo: row.photo,

  admissionYear: row.admissionyear,

  department: {
    id: row.department_id,
    name: row.department_name,
  },

  faculty: {
    id: row.faculty_id,
    name: row.faculty_name,
  },

  level: {
    id: row.level_id,
    name: row.level_name,
  },

  session: {
    id: row.session_id,
    name: row.session_name,
  },
});

const mapAdminProfile = (row) => ({
  id: row.admin_id,

  employeeId: row.employeeid,

  firstName: row.firstname,
  lastName: row.lastname,

  fullName: `${row.firstname} ${row.lastname}`,

  email: row.email,

  phone: row.phone,

  department: row.department,

  position: row.position,

  office: row.office,

  photo: row.photo,

  lastLogin: row.lastlogin,

  isActive: row.isactive,
});

export { mapStudentProfile, mapAdminProfile };
