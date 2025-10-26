import { Router } from "express"
import {
    checkUsername,
    registerInfo,
    registerValidate,
    loginInfo,
    loginValidate,
    logout,
    changePassword,
    refreshAccessToken
} from "../controllers/auth/index.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/check-username", checkUsername)
router.post("/register", registerInfo);
router.post("/register/validate", registerValidate);

router.post("/login", loginInfo);
router.post("/login/validate", loginValidate);

router.post("/logout", authMiddleware, logout);

router.post("/refresh-token", refreshAccessToken);
router.patch("/change-password", authMiddleware, changePassword);

export default router;