import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"
import { Session } from "../../models/session.model.js";
import { getDeviceName } from "../../services/ua-parser.js";
import { addSessionHash } from "../../services/redis/sessionHash.js"

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

    const session = await Session.create({
        userId: user._id,
        deviceName: getDeviceName(req),
        ip: req.ip,
        refreshToken
    })

    // Add in redis
    await addSessionHash(username, session._id);

    return res
        .status(statusCode.CREATED)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS_RT)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS_AT)
        .cookie("sessionId", session._id.toString(), COOKIE_OPTIONS_RT)
        .json(new ApiResponse(
            statusCode.CREATED,
            "User registered successfully",
            {
                user: {
                    fullname: user.fullname,
                    username: user.username,
                },
                accessToken,
                sessionId: session._id
            }));
});

