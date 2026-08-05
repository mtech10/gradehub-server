import Joi from "joi";

export const createDepartmentSchema = Joi.object({
  name: Joi.string().min(3).max(150).required(),

  code: Joi.string().max(20).required(),

  faculty: Joi.string().allow("", null),

  hod: Joi.string().allow("", null),

  description: Joi.string().allow("", null),
});

export const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(3).max(150),

  code: Joi.string().max(20),

  faculty: Joi.string().allow("", null),

  hod: Joi.string().allow("", null),

  description: Joi.string().allow("", null),
});
