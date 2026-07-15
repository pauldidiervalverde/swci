import { successResponse, errorResponse } from "../../utils/response.js";

import { loginSchema } from "./auth.validation.js";

import { loginService, obtenerMenuService } from "./auth.service.js";

export const loginController = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginService(data.usuario, data.password);

    return successResponse(res, result, "Login correcto");
  } catch (error) {
    return errorResponse(res, error.message, error.status || 500);
  }
};

export const menuController = async (req, res) => {
  try {
    const data = await obtenerMenuService(req.user.id);

    return successResponse(res, data, "Menú obtenido correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
