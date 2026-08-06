import Joi from "joi";

export const createDepartmentSchema = Joi.object({
  name: Joi.string().min(3).max(150).required(),

  code: Joi.string().max(20).required(),

  facultyId: Joi.string().guid({ version: "uuidv4" }).required(),

  hod: Joi.string().allow("", null),

  description: Joi.string().allow("", null),
});

export const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(3).max(150),

  code: Joi.string().max(20),

  facultyId: Joi.string().guid({ version: "uuidv4" }),

  hod: Joi.string().allow("", null),

  description: Joi.string().allow("", null),
});
