import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const register = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
        throw new ApiError(statusCode.BAD_REQUEST, "All fields are required");
    }

    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
        throw new ApiError(statusCode.CONFLICT, "User already exists");
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
        .status(statusCode.CREATED)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS_RT)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(statusCode.CREATED, "User registered successfully", { user: resUser, accessToken }));
});

