const mapLevel = (level) => ({
  id: level.id,
  name: level.name,
  description: level.description,

  isActive: level.isactive,

  createdAt: level.createdat,
  updatedAt: level.updatedat,
});

export default mapLevel;
