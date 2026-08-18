// const mapStudent = (student) => ({
//   id: student.id,
//   matricNumber: student.matricnumber,

//   firstName: student.firstname,
//   middleName: student.middlename,
//   lastName: student.lastname,

//   gender: student.gender,

//   email: student.email,
//   phone: student.phone,

//   dateOfBirth: student.dateofbirth,

//   admissionYear: student.admissionyear,

//   department: student.department_id
//     ? {
//         id: student.department_id,
//         name: student.department_name,
//         code: student.department_code,
//       }
//     : null,

//   level: student.level_id
//     ? {
//         id: student.level_id,
//         name: student.level_name,
//       }
//     : null,

//   session: student.session_id
//     ? {
//         id: student.session_id,
//         name: student.session_name,
//       }
//     : null,

//   photo: student.photo,

//   isActive: student.isactive,

//   createdAt: student.createdat,
//   updatedAt: student.updatedat,
// });

// export default mapStudent;

const mapStudent = (row) => {
  if (!row) return null;

  const isActive = row.isactive ?? row.isActive ?? true;

  return {
    id: row.id,
    matricNumber: row.matricnumber || row.matricNumber,
    firstName: row.firstname || row.firstName,
    middleName: row.middlename || row.middleName,
    lastName: row.lastname || row.lastName,
    fullName: `${row.firstname || ""} ${row.lastname || ""}`.trim(),
    email: row.email,
    gender: row.gender,
    phone: row.phone || row.phonenumber,
    dateOfBirth: row.dateofbirth || row.dateOfBirth,
    admissionYear: row.admissionyear || row.admissionYear,
    photo: row.photo,
    isActive: isActive,
    status: isActive ? "Active" : "Inactive", // <-- Maps status dynamically based on db boolean
    department: {
      id: row.department_id || row.departmentid,
      name: row.department_name,
      code: row.department_code,
    },
    level: {
      id: row.level_id || row.levelid,
      name: row.level_name,
    },
    session: {
      id: row.session_id || row.sessionid,
      name: row.session_name,
    },
    createdAt: row.createdat || row.createdAt,
    updatedAt: row.updatedat || row.updatedAt,
  };
};

export default mapStudent;
