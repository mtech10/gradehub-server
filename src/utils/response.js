export const response = (
  res,
  data = null,
  message = "Success",
  statusCode = 200,
  pagination = null,
) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};
