import { Router } from "express"
import { getProfile, updateProfile, deleteProfile } from "../controllers/profile/index.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.delete("/", authMiddleware, deleteProfile);

export default router;