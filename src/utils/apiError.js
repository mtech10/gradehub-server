const apiError = (statusCode, message, errors = []) => {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.errors = errors;

  return error;
};

export default apiError;
