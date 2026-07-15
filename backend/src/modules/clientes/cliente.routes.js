import { Router } from "express";
import * as controller from "./cliente.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", controller.listar);

router.get("/buscar", controller.buscar);

router.get("/:id", controller.obtener);

router.post("/", controller.crear);

router.put("/:id", controller.actualizar);

router.patch("/:id/estado", controller.cambiarEstado);

export default router;
