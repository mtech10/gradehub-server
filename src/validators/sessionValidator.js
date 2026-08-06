import Joi from "joi";

export const createSessionSchema = Joi.object({
  name: Joi.string().trim().required(),

  startdate: Joi.date().required(),

  enddate: Joi.date().greater(Joi.ref("startdate")).required(),
});

export const updateSessionSchema = Joi.object({
  name: Joi.string().trim(),

  startdate: Joi.date(),

  enddate: Joi.date(),

  isCurrent: Joi.boolean(),
});
