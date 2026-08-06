const mapStudent = (student) => ({
  id: student.id,
  matricNumber: student.matricnumber,

  firstName: student.firstname,
  middleName: student.middlename,
  lastName: student.lastname,

  gender: student.gender,

  email: student.email,
  phone: student.phone,

  dateOfBirth: student.dateofbirth,

  admissionYear: student.admissionyear,

  department: student.department_id
    ? {
        id: student.department_id,
        name: student.department_name,
        code: student.department_code,
      }
    : null,

  level: student.level_id
    ? {
        id: student.level_id,
        name: student.level_name,
      }
    : null,

  session: student.session_id
    ? {
        id: student.session_id,
        name: student.session_name,
      }
    : null,

  photo: student.photo,

  isActive: student.isactive,

  createdAt: student.createdat,
  updatedAt: student.updatedat,
});

export default mapStudent;
