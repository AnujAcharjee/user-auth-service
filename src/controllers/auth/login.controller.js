import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"
import { Session } from "../../models/session.model.js"
import { getDeviceName } from "../../services/ua-parser.js"
import { addSessionHash } from "../../services/redis/sessionHash.js"

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

    const session = await Session.create({
        userId: user._id,
        deviceName: getDeviceName(req),
        ip: req.ip,
        refreshToken
    })

    // Add in redis
    await addSessionHash(username, session._id);

    return res
        .status(statusCode.OK)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS_RT)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS_AT)
        .cookie("sessionId", session._id.toString(), COOKIE_OPTIONS_RT)
        .json(new ApiResponse(
            statusCode.OK,
            "User logged in successfully",
            {
                user: {
                    fullname: user.fullname,
                    username: user.username,

                },
                accessToken,
                sessionId: session._id
            }));
})