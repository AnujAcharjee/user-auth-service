import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { Session } from "../../models/session.model.js";
import { delSessionHash } from "../../services/redis/sessionHash.js"

export const logout = asyncHandler(async (req, res) => {
    const { username } = req.user;
    const { sessionId } = req.cookies;

    if (!sessionId) {
        throw new ApiError(statusCode.UNAUTHORIZED, "User not logged in");
    }

    const session = await Session.findById(sessionId);

    if (!session) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Invalid session id");
    }

    await Session.findByIdAndUpdate(sessionId, {
        $unset: { refreshToken: 1 },
        $set: { loggedOutOn: Date.now() }
    });

    // Delete from redis
    await delSessionHash(username, session._id);

    return res
        .status(statusCode.OK)
        .cookie("refreshToken", "", { ...COOKIE_OPTIONS_RT, expires: new Date(0) })
        .cookie("accessToken", "", { ...COOKIE_OPTIONS_AT, expires: new Date(0) })
        .cookie("sessionId", "", { ...COOKIE_OPTIONS_RT, expires: new Date(0) })
        .json(new ApiResponse(statusCode.OK, "User logged out successfully"));
});
