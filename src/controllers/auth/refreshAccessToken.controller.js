import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"
import { Session } from "../../models/session.model.js"
import { verifyToken } from "../../services/jwt.js";

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    const { sessionId } = req.cookies;

    if (!refreshToken || !sessionId) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Refresh token or session id missing");
    }

    const session = await Session.findById(sessionId).select("refreshToken");

    if (!session) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Invalid session id");
    }

    if (!session.refreshToken || session.refreshToken !== refreshToken) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Invalid refresh token");
    }

    const decodedRefreshToken = verifyToken(refreshToken);

    const user = await User.findById(decodedRefreshToken._id).select("_id fullname username");

    if (!user) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Invalid user id");
    }

    const newAccessToken = await user.generateAccessToken();

    return res
        .status(statusCode.OK)
        .cookie("accessToken", newAccessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(statusCode.OK, "Access token refreshed successfully", { accessToken: newAccessToken }));
})