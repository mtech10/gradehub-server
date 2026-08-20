



































const mapCourse = (course) => ({
  id: course.id,

  code: course.code,

  title: course.title,

  creditUnit: course.creditunit,

  description: course.description,

  isActive: course.isactive,

  createdAt: course.createdat,

  updatedAt: course.updatedat,

  department: {
    id: course.department_id,
    name: course.department_name,
    code: course.department_code,
  },

  level: {
    id: course.level_id,
    name: course.level_name,
  },

  
  semester: course.semester,
});

export default mapCourse;
