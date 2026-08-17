// const mapCourse = (course) => ({
//   id: course.id,

//   code: course.code,

//   title: course.title,

//   creditUnit: course.creditunit,

//   description: course.description,

//   isActive: course.isactive,

//   createdAt: course.createdat,

//   updatedAt: course.updatedat,

//   department: {
//     id: course.department_id,
//     name: course.department_name,
//     code: course.department_code,
//   },

//   level: {
//     id: course.level_id,
//     name: course.level_name,
//   },

//   semester: {
//     id: course.semester_id,
//     name: course.semester_name,
//   },
// });

// export default mapCourse;

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

  // Flattens the semester to just pass the string (e.g., "First Semester")
  semester: course.semester,
});

export default mapCourse;
