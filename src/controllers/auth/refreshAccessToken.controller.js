import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"
import { verifyToken } from "../../services/jwt.js";

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Refresh token is missing");
    }

    const decodedRefreshToken = verifyToken(refreshToken);

    const user = await User.findById(decodedRefreshToken._id).select("_id fullname username refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Invalid refresh token");
    }

    const newAccessToken = await user.generateAccessToken();

    req.user = {
        _id: user._id,
        fullname: user.fullname,
        username: user.username
    };

    return res
        .status(statusCode.OK)
        .cookie("accessToken", newAccessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(statusCode.OK, "Access token refreshed successfully", { accessToken: newAccessToken }));
})