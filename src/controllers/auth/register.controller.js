import { asyncExpressHandler, AppError, ApiResponse, STATUS_CODES, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const register = asyncExpressHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
        throw new AppError(STATUS_CODES.BAD_REQUEST, "All fields are required");
    }

    let user = await User.create({ fullname, username, email, password });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const resUser = {
        fullname: user.fullname,
        username: user.username,
    }

    return res
        .status(STATUS_CODES.CREATED)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS_RT)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(STATUS_CODES.CREATED, "User registered successfully", { user: resUser, accessToken }));
});

