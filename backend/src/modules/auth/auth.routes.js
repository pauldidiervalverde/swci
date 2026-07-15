import { Router } from "express";

import { loginController, menuController } from "./auth.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginController);

router.get("/menu", authMiddleware, menuController);

export default router;
