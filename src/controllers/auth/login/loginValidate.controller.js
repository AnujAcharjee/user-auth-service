import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../../utils/index.js"
import { User } from "../../../models/user.model.js"
import { Session } from "../../../models/session.model.js"
import { getDeviceName } from "../../../services/ua-parser.js"
import { setSessionCache } from "../../../services/redis/sessionCache.js"
import { getUserCache, delUserCache } from "../../../services/redis/userCache.js"
import { randomUUID } from "crypto";

export const loginValidate = asyncHandler(async (req, res) => {
    const { username, otp } = req.body;

    if (!username || !otp) {
        throw new ApiError(statusCode.BAD_REQUEST, "Email and OTP are required");
    }

    // get user 
    const user = await User.findOne({ username }).select("_id fullname username email");
    if (!user) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Authentication failed");
    }

    // Get cached data
    const cachedUser = await getUserCache("AUTH", user.email);
    if (!cachedUser || !cachedUser.otp || !cachedUser.email) {
        throw new ApiError(statusCode.NOT_FOUND, "OTP expired");
    };

    // Compare OTP
    if (cachedUser.otp !== otp) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Invalid OTP");
    }

    let sessionId, refreshToken, accessToken, redisRes = false;
    // retry if sessionId already exists
    while (!redisRes) {
        sessionId = randomUUID();
        refreshToken = user.generateRefreshToken(sessionId);
        accessToken = user.generateAccessToken(sessionId);
        redisRes = await setSessionCache(username, sessionId, refreshToken);
    }

    // create session in DB
    await Session.create({
        sessionId,
        userId: user._id,
        deviceName: getDeviceName(req),
        ip: req.ip,
        refreshToken
    })

    // Delete cached data
    await delUserCache("AUTH", user.email);

    return res
        .status(statusCode.OK)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS_RT)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(
            statusCode.OK,
            "User logged in successfully",
            {
                user: {
                    fullname: user.fullname,
                    username: user.username
                },
                accessToken
            }));
})