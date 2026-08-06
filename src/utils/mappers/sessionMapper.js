export const mapSession = (session) => ({
  id: session.id,

  name: session.name,

  startdate: session.startdate,

  enddate: session.enddate,

  isCurrent: session.iscurrent,

  isActive: session.isactive,

  createdAt: session.createdat,

  updatedAt: session.updatedat,
});
