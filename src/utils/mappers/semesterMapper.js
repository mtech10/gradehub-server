export const mapSemester = (semester) => ({
  id: semester.id,

  name: semester.name,

  startDate: semester.startdate,

  endDate: semester.enddate,

  isCurrent: semester.iscurrent,

  isActive: semester.isactive,

  createdAt: semester.createdat,

  updatedAt: semester.updatedat,

  session: {
    id: semester.session_id,
    name: semester.session_name,
  },
});
