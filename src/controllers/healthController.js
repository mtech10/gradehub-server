export const healthCheck = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "GradeHub API is running",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
};
