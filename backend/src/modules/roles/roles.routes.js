import { Router } from "express";
import * as controller from "./roles.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { storeMiddleware } from "../../middlewares/store.middleware.js";
const router = Router();
router.use(authMiddleware);
router.use(storeMiddleware);
// CRUD ROLES
router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.patch("/:id/estado", controller.estado);
// PERMISOS (preparado)
router.get("/:id/permisos", controller.obtenerPermisos);
router.put("/:id/permisos", controller.actualizarPermisos);
export default router;
