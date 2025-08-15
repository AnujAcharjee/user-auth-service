import { User } from "../models/user.model.js";
import { verifyToken } from "../services/jwt.js";
import { AppError, STATUS_CODES } from "../utils/index.js";

// Verify access Token
export const authMiddleware = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace(/bearer\s+/i, "");

        if (!accessToken) {
            return next(new AppError(STATUS_CODES.UNAUTHORIZED, "Access token missing"));
        }

        const decodedAccessToken = verifyToken(accessToken);

        if (decodedAccessToken) {
            const user = await User.findById(decodedAccessToken._id).select("_id fullname username");
            if (!user) {
                return next(new AppError(STATUS_CODES.UNAUTHORIZED, "User not found"));
            }

            req.user = user;
            return next();
        }
    } catch (error) {
        return next(new AppError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Authentication failed"));
    }
}