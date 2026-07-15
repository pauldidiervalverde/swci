import { Router } from "express";
import * as controller from "./reporte.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { storeMiddleware } from "../../middlewares/store.middleware.js";
const router = Router();
router.use(authMiddleware);
router.use(storeMiddleware);
//////////////////////////////////////////////////////////////////////
// RUTAS DE REPORTES
//////////////////////////////////////////////////////////////////////
router.get("/diario", controller.obtenerReporteDiario);
export default router;
