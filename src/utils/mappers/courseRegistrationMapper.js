const mapCourseRegistration = (row) => ({
  id: row.id,

  student: {
    id: row.student_id,
    matricNumber: row.student_matricnumber,
    firstName: row.student_firstname,
    lastName: row.student_lastname,
  },

  course: {
    id: row.course_id,
    code: row.course_code,
    title: row.course_title,
    unit: row.course_unit,
  },

  session: {
    id: row.session_id,
    name: row.session_name,
  },

  semester: {
    id: row.semester_id,
    name: row.semester_name,
  },

  registeredAt: row.registeredat,

  isActive: row.isactive,

  createdAt: row.createdat,

  updatedAt: row.updatedat,
});

export default mapCourseRegistration;
