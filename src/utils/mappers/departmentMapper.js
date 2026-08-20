export const mapDepartment = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    hod: row.hod,
    description: row.description,
    isActive: row.isactive,
    createdAt: row.createdat,
    updatedAt: row.updatedat,
    faculty: {
      id: row.faculty_id,
      name: row.faculty_name,
      code: row.faculty_code,
    },
    
    students: Number(row.student_count || 0),
    courses: Number(row.course_count || 0),
    lecturers: Number(row.lecturer_count || 0),
    lecturersList: row.lecturersList || [],
  };
};
