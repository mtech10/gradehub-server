import Joi from "joi";

export const createFacultySchema = Joi.object({
  name: Joi.string().trim().min(3).max(150).required(),

  code: Joi.string().trim().uppercase().min(2).max(20).required(),

  dean: Joi.string().trim().max(150).allow("", null),

  description: Joi.string().trim().allow("", null),
});

export const updateFacultySchema = Joi.object({
  name: Joi.string().trim().min(3).max(150),

  code: Joi.string().trim().uppercase().min(2).max(20),

  dean: Joi.string().trim().max(150).allow("", null),

  description: Joi.string().trim().allow("", null),
}).min(1);
