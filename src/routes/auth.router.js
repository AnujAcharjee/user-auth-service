import { Router } from "express"
import { changePassword, login, register, logout, refreshAccessToken } from "../controllers/auth/index.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/refresh-token", refreshAccessToken);
router.patch("/change-password", authMiddleware, changePassword);

export default router;