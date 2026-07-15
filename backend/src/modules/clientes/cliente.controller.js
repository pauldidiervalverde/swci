import * as service from "./cliente.service.js";
import {
  crearClienteSchema,
  actualizarClienteSchema,
  cambiarEstadoSchema,
} from "./cliente.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export async function crear(req, res) {
  try {
    const body = crearClienteSchema.parse(req.body);

    const data = await service.crearCliente(body);

    return successResponse(res, data, "Cliente creado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}

export async function actualizar(req, res) {
  try {
    const body = actualizarClienteSchema.parse(req.body);

    const data = await service.actualizarCliente(Number(req.params.id), body);

    return successResponse(res, data, "Cliente actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}

export async function listar(req, res) {
  try {
    const data = await service.obtenerClientes();

    return successResponse(res, data, "Clientes obtenidos correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function buscar(req, res) {
  try {
    const q = req.query.q ?? "";

    const data = await service.buscarClientes(q);

    return successResponse(res, data, "Clientes encontrados correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function obtener(req, res) {
  try {
    const data = await service.obtenerClientePorId(Number(req.params.id));

    return successResponse(res, data, "Cliente obtenido correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}

export async function cambiarEstado(req, res) {
  try {
    const body = cambiarEstadoSchema.parse(req.body);

    const data = await service.cambiarEstado(
      Number(req.params.id),
      body.estado,
    );

    return successResponse(res, data, "Estado actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
