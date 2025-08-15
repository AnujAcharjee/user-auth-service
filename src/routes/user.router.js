import { Router } from "express"
import { profile } from "../controllers/user/index.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/profile", authMiddleware, profile);

export default router;