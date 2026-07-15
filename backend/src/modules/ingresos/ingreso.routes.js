import { Router } from "express";
import * as controller from "./ingreso.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { storeMiddleware } from "../../middlewares/store.middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(storeMiddleware);

router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);

export default router;
