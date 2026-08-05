const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validateUUID = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!uuidRegex.test(value)) {
      return res.status(400).json({
        success: false,
        message: `${paramName} must be a valid UUID`,
      });
    }

    next();
  };
};

export default validateUUID;
