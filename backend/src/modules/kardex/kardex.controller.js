import * as service from "./kardex.service.js";
import {
  listarKardexSchema,
  obtenerKardexProductoSchema,
} from "./kardex.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
/**
 * Reporte general de Kardex.
 */
export async function listar(req, res) {
  try {
    const query = listarKardexSchema.parse(req.query);
    const data = await service.obtenerKardex(query, req.store.id);
    return successResponse(res, data, "Kardex obtenido correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
/**
 * Kardex de un producto.
 */
export async function obtenerProducto(req, res) {
  try {
    const params = obtenerKardexProductoSchema.parse(req.params);
    const data = await service.obtenerKardexProducto(
      Number(params.productoId),
      req.store.id,
    );
    return successResponse(
      res,
      data,
      "Kardex del producto obtenido correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
