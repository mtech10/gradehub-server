import * as registrationRuleService from "../services/registrationRuleService.js";
import { response } from "../utils/response.js";
import { notifyAdmins } from "../services/notificationService.js";

export const saveRule = async (req, res, next) => {
  try {
    const rule = await registrationRuleService.saveRegistrationRule(req.body);

    await notifyAdmins({
      title: "Registration Rule Updated",
      message: `A course registration unit limit was created or updated.`,
      category: "system",
    });

    return response(res, rule, "Registration rule saved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getRules = async (req, res, next) => {
  try {
    const rules = await registrationRuleService.getRegistrationRules();
    return response(
      res,
      rules,
      "Registration rules retrieved successfully",
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    const rule = await registrationRuleService.deleteRegistrationRule(
      req.params.id,
    );
    return response(res, rule, "Registration rule deleted successfully", 200);
  } catch (error) {
    next(error);
  }
};
