import { asyncExpressHandler, AppError, ApiResponse, STATUS_CODES, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const login = asyncExpressHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new AppError(STATUS_CODES.BAD_REQUEST, "Username and password are required");
    }

    const user = await User.findOne({ username }).select("fullname username password");

    if (!user || !(await user.verifyPassword(password))) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "Authentication failed");
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
        .status(STATUS_CODES.OK)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS_RT)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(STATUS_CODES.OK, "User logged in successfully", { user: resUser, accessToken }));
})