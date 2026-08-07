const mapNotification = (row) => ({
  id: row.id,

  title: row.title,

  message: row.message,

  category: row.category,

  isRead: row.isread,

  createdAt: row.createdat,
});

export default mapNotification;
