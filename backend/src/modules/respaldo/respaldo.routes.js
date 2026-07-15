import { Router } from "express";
import * as controller from "./respaldo.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

// Protegemos las rutas con tu middleware de autenticación
router.use(authMiddleware);

// POST /api/respaldos/crear
router.post("/crear", controller.crear);

// POST /api/respaldos/restaurar
router.post("/restaurar", controller.restaurar);

export default router;
