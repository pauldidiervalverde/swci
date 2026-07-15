import { Router } from "express";
import * as controller from "./producto.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { storeMiddleware } from "../../middlewares/store.middleware.js";

const router = Router();
router.use(authMiddleware);
router.use(storeMiddleware);

router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.patch("/:id/estado", controller.cambiarEstado);
// Rutas para la Carga Masiva desde Excel
router.post("/excel/simular", controller.simularCarga);
router.post("/excel/confirmar", controller.confirmarCarga);

export default router;
