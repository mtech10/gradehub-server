export const mapFaculty = (faculty) => ({
  id: faculty.id,
  name: faculty.name,
  code: faculty.code,
  dean: faculty.dean,
  description: faculty.description,

  isActive: faculty.isactive,

  createdAt: faculty.createdat,
  updatedAt: faculty.updatedat,
});
