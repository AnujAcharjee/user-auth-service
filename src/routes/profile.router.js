import { Router } from "express"
import { getProfile, getBasicProfile, getFNG, updateProfile, deleteProfile, search } from "../controllers/profile/index.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router
    .get("/", authMiddleware, getProfile)
    .get("/basic", authMiddleware, getBasicProfile)
    .get("/fng", authMiddleware, getFNG)
    .get("/search", authMiddleware, search)
    .put("/", authMiddleware, updateProfile)
    .delete("/", authMiddleware, deleteProfile)

export default router;