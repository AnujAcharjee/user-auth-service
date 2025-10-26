import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../../utils/index.js"
import { User } from "../../../models/user.model.js"
import { Session } from "../../../models/session.model.js";
import { getDeviceName } from "../../../services/ua-parser.js";
import { setSessionCache } from "../../../services/redis/sessionCache.js";
import { getUserCache, delUserCache } from "../../../services/redis/userCache.js"
import { addBloomFilter } from "../../../services/bloom-filter.js";
import { addElasticSearch } from "../../../services/elasticSearch/index.js"
import { randomUUID } from "crypto";

export const registerValidate = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(statusCode.BAD_REQUEST, "Email and OTP are required");
    }

    // Get cached data
    const cachedUser = await getUserCache("AUTH", email);
    if (!cachedUser || !cachedUser.otp || !cachedUser.fullname || !cachedUser.username || !cachedUser.email || !cachedUser.password) {
        throw new ApiError(statusCode.NOT_FOUND, "OTP expired");
    }

    // Compare OTP
    if (cachedUser.otp !== otp) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Invalid OTP");
    }

    // Save user to DB
    let user = await User.create({
        fullname: cachedUser.fullname,
        username: cachedUser.username,
        email: cachedUser.email,
        password: cachedUser.password,
    });

    // Add username to bloom filter
    addBloomFilter(cachedUser.username);

    let sessionId, refreshToken, accessToken, redisRes = false;
    // retry if sessionId already exists
    while (!redisRes) {
        sessionId = `sn-${randomUUID()}`;
        refreshToken = user.generateRefreshToken(sessionId);
        accessToken = user.generateAccessToken(sessionId);

        redisRes = await setSessionCache(cachedUser.username, sessionId, refreshToken);
    }

    // create session in DB
    await Session.create({
        sessionId,
        userId: user._id,
        deviceName: getDeviceName(req),
        ip: req.ip,
        refreshToken
    })

    // add in elastic search
    await addElasticSearch(cachedUser.fullname, cachedUser.username)

    // Delete cached data
    await delUserCache("AUTH", email);

    return res
        .status(statusCode.CREATED)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS_RT)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS_AT)
        .json(new ApiResponse(
            statusCode.CREATED,
            "User registered successfully",
            {
                user: {
                    fullname: cachedUser.fullname,
                    username: cachedUser.username,
                },
                accessToken
            }));
});

