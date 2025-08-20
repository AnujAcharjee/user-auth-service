import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(statusCode.BAD_REQUEST, "Username and password are required");
    }

    const user = await User.findOne({ username }).select("fullname username password");

    if (!user || !(await user.verifyPassword(password))) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Authentication failed");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const resUser = {
        fullname: user.fullname,
        username: user.username,
    }

    return res
        .status(statusCode.OK)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS_RT)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(statusCode.OK, "User logged in successfully", { user: resUser, accessToken }));
})