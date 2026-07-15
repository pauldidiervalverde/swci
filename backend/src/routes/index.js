import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import usuariosRoutes from "../modules/usuarios/usuarios.routes.js";
import marcasRoutes from "../modules/marcas/marcas.routes.js";
import categoriasRoutes from "../modules/categorias/categorias.routes.js";
import productoRoutes from "../modules/productos/producto.routes.js";
import clienteRoutes from "../modules/clientes/cliente.routes.js";
import ingresoRoutes from "../modules/ingresos/ingreso.routes.js";
import salidaRoutes from "../modules/salidas/salida.routes.js";
import ventaRoutes from "../modules/ventas/venta.routes.js";
import kardexRoutes from "../modules/kardex/kardex.routes.js";
import tiposPagoRoutes from "../modules/tiposPago/tipoPago.routes.js";
import tiposMovimientoRoutes from "../modules/tiposMovimientos/tiposMovimiento.routes.js";
import respaldoRoutes from "../modules/respaldo/respaldo.routes.js";
import reporteRoutes from "../modules/reportes/reporte.routes.js";
import rolesRoutes from "../modules/roles/roles.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/productos", productoRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/categorias", categoriasRoutes);
router.use("/marcas", marcasRoutes);
router.use("/clientes", clienteRoutes);
router.use("/ingresos", ingresoRoutes);
router.use("/salidas", salidaRoutes);
router.use("/ventas", ventaRoutes);
router.use("/tipos-movimiento", tiposMovimientoRoutes);
router.use("/tipos-pago", tiposPagoRoutes);
router.use("/respaldos", respaldoRoutes);
router.use("/kardex", kardexRoutes);
router.use("/reportes", reporteRoutes);
router.use("/roles", rolesRoutes);
export default router;
