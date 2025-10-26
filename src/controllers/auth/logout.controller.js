import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { Session } from "../../models/session.model.js";
import { delSessionCache } from "../../services/redis/sessionCache.js"

export const logout = asyncHandler(async (req, res) => {
    const sessionId = req?.sessionId;
    console.log(sessionId);

    const username = req?.user.username;

    if (!sessionId || !username) {
        throw new ApiError(statusCode.UNAUTHORIZED, "User not logged in");
    }

    // get session 
    const session = await Session.findOne({ sessionId });

    if (!session) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Invalid sessionId");
    }

    // Invalidate refresh token in DB + set logout date   
    await Session.findOneAndUpdate(
        { sessionId },
        {
            $unset: { refreshToken: 1 },
            $set: { loggedOutOn: Date.now() },
        }
    );

    // Delete from redis
    await delSessionCache(username, sessionId);

    return res
        .status(statusCode.OK)
        .cookie("refreshToken", "", { ...COOKIE_OPTIONS_RT, expires: new Date(0) })
        .cookie("accessToken", "", { ...COOKIE_OPTIONS_AT, expires: new Date(0) })
        .json(new ApiResponse(statusCode.OK, "User logged out successfully"));
});
