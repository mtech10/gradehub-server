import Joi from "joi";

export const createSemesterSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),

  name: Joi.string()
    .valid("First Semester", "Second Semester", "Summer")
    .required(),

  startDate: Joi.date().required(),

  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
});

export const updateSemesterSchema = Joi.object({
  sessionId: Joi.string().uuid(),

  name: Joi.string().valid("First Semester", "Second Semester", "Summer"),

  startDate: Joi.date(),

  endDate: Joi.date(),

  isCurrent: Joi.boolean(),
});
