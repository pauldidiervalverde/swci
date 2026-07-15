import { Router } from "express";
import { obtenerStock } from "./stock.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { storeMiddleware } from "../../middlewares/store.middleware.js";

const router = Router();
router.use(authMiddleware);
router.use(storeMiddleware);

router.get("/:productoId", obtenerStock);

export default router;
