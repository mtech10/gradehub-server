
















































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
    status: isActive ? "Active" : "Inactive", 
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
