import { asyncExpressHandler, AppError, ApiResponse, STATUS_CODES, COOKIE_OPTIONS_AT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"
import { verifyToken } from "../../services/jwt.js";

export const refreshAccessToken = asyncExpressHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "Please log in");
    }

    const decodedRefreshToken = verifyToken(refreshToken);
    
    const user = await User.findById(decodedRefreshToken._id).select("_id fullname username refreshToken");
    
    if (!user || user.refreshToken !== refreshToken) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "Invalid token");
    }

    const newAccessToken = await user.generateAccessToken();

    req.user = {
        _id: user._id,
        fullname: user.fullname,
        username: user.username
    };

    return res
        .status(STATUS_CODES.OK)
        .cookie("accessToken", newAccessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(STATUS_CODES.OK, "Access token refreshed successfully", { accessToken: newAccessToken }));
})