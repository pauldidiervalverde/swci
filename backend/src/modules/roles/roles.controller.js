import * as service from "./roles.service.js";
export async function listar(req, res) {
  const data = await service.obtenerRoles();
  return res.json({
    success: true,
    data,
  });
}
export async function obtener(req, res) {
  const data = await service.obtenerRolPorId(Number(req.params.id));
  return res.json({
    success: true,
    data,
  });
}
export async function crear(req, res) {
  const data = await service.crearRol(req.body);
  return res.status(201).json({
    success: true,
    message: "Rol creado",
    data,
  });
}
export async function actualizar(req, res) {
  const data = await service.actualizarRol(Number(req.params.id), req.body);
  return res.json({
    success: true,
    message: "Rol actualizado",
    data,
  });
}
export async function estado(req, res) {
  const data = await service.cambiarEstado(
    Number(req.params.id),
    req.body.estado,
  );
  return res.json({
    success: true,
    message: "Estado actualizado",
    data,
  });
}
// ==============================
// PERMISOS
// ==============================
export async function obtenerPermisos(req, res) {
  const data = await service.obtenerPermisosRol(Number(req.params.id));
  return res.json({
    success: true,
    data,
  });
}
export async function actualizarPermisos(req, res) {
  const data = await service.actualizarPermisosRol(
    Number(req.params.id),
    req.body.permisos,
  );
  return res.json({
    success: true,
    message: "Permisos actualizados",
    data,
  });
}
