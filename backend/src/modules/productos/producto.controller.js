import * as service from "./producto.service.js";
import {
  crearProductoSchema,
  actualizarProductoSchema,
  cambiarEstadoSchema,
  simularCargaMasivaSchema,
  confirmarCargaMasivaSchema,
} from "./producto.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export async function simularCarga(req, res) {
  try {
    // Validamos el body que contiene la categoriaId y el array de productos del Excel
    const body = simularCargaMasivaSchema.parse(req.body);
    // Pasamos el cuerpo y el objeto 'store' inyectado de forma segura por tu middleware
    const data = await service.simularCargaMasiva(body, req.store);
    return successResponse(
      res,
      data,
      "Simulación de carga masiva procesada correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function confirmarCarga(req, res) {
  try {
    const body = confirmarCargaMasivaSchema.parse(req.body);
    // Guardamos los registros bajo la tienda autorizada en la sesión activa
    const data = await service.confirmarCargaMasiva(body, req.store);
    return successResponse(
      res,
      data,
      "Carga masiva guardada con éxito en el inventario",
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function listar(req, res) {
  try {
    //const search = req.query.search || "";
    const {
      search = "",
      categoriaId,
      marcaId,
      page = 1,
      color = "",
    } = req.query;

    const resultado = await service.obtenerProductos({
      search,
      color,
      categoriaId,
      marcaId,
      page,
      tiendaId: req.store.id,
    });

    // Devolvemos la estructura incluyendo el total general
    return successResponse(
      res,
      { data: resultado.productos, total: resultado.total },
      "Productos obtenidos correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function obtener(req, res) {
  try {
    const data = await service.obtenerProductoPorId(
      Number(req.params.id),
      req.store.id,
    );
    return successResponse(res, data, "Producto obtenido correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}
export async function crear(req, res) {
  try {
    const body = crearProductoSchema.parse(req.body);
    const data = await service.crearProducto(body, req.store);
    return successResponse(res, data, "Producto creado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function actualizar(req, res) {
  try {
    const body = actualizarProductoSchema.parse(req.body);
    const data = await service.actualizarProducto(
      Number(req.params.id),
      body,
      req.store,
    );
    return successResponse(res, data, "Producto actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function cambiarEstado(req, res) {
  try {
    const body = cambiarEstadoSchema.parse(req.body);
    const data = await service.cambiarEstado(
      Number(req.params.id),
      body.estado,
      req.store.id,
    );
    return successResponse(res, data, "Estado actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
