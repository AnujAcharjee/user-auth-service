import { User } from "../models/user.model.js";
import { verifyToken } from "../services/jwt.js";
import { ApiError, statusCode } from "../utils/index.js";

// Verify access Token
export const authMiddleware = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace(/bearer\s+/i, "");

        if (!accessToken) {
            return next(new ApiError(statusCode.UNAUTHORIZED, "Access token missing"));
        }

        let decodedAccessToken;
        try {
            decodedAccessToken = verifyToken(accessToken);
        } catch (err) {
            return next(new ApiError(statusCode.UNAUTHORIZED, "Invalid access token"));
        }

        const user = await User.findById(decodedAccessToken._id).select("_id fullname username");
        if (!user) {
            return next(new ApiError(statusCode.UNAUTHORIZED, "User not found"));
        }

        req.user = user;
        return next();
    } catch (error) {
        return next(new ApiError(statusCode.INTERNAL_SERVER_ERROR, "Authentication failed"));
    }
}