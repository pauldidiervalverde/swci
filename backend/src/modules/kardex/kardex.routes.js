import { Router } from "express";
import * as controller from "./kardex.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { storeMiddleware } from "../../middlewares/store.middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(storeMiddleware);

/**
 * Reporte General de Kardex GET /kardex
 * Query Params:
 *  fechaInicio -fechaFin -categoriaId -marcaId -tipoMovimientoId -search
 */
router.get("/", controller.listar);

/**
 * Kardex de un producto GET /kardex/:productoId
 */
router.get("/:productoId", controller.obtenerProducto);

export default router;
