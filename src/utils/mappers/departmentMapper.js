export const mapDepartment = (department) => ({
  id: department.id,
  name: department.name,
  code: department.code,
  hod: department.hod,
  description: department.description,

  isActive: department.isactive,

  createdAt: department.createdat,
  updatedAt: department.updatedat,

  faculty: {
    id: department.faculty_id,
    name: department.faculty_name,
    code: department.faculty_code,
  },
});
