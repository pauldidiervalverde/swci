import { Router } from "express";
import * as controller from "./tiposMovimiento.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const router = Router();
router.use(authMiddleware);
router.get("/", controller.listar);
router.get("/ingresos", controller.searchIngresos);
router.get("/egresos", controller.searchEgresos);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.patch("/:id/estado", controller.estado);

export default router;
