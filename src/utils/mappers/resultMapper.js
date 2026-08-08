const mapResult = (row) => ({
  id: row.id,

  caScore: Number(row.ca_score),
  examScore: Number(row.exam_score),
  totalScore: Number(row.total_score),

  grade: row.grade,
  gradePoint: Number(row.gradepoint),
  remark: row.remark,

  isApproved: row.isapproved,
  isActive: row.isactive,

  createdAt: row.createdat,
  updatedAt: row.updatedat,

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
    creditUnit: Number(row.course_unit),
  },

  session: {
    id: row.session_id,
    name: row.session_name,
  },

  semester: {
    id: row.semester_id,
    name: row.semester_name,
  },
});

export default mapResult;
