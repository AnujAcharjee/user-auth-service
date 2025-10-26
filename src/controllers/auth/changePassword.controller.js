import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../utils/index.js"
import { User } from "../../models/user.model.js"
import { Session } from "../../models/session.model.js"
import { delSessionCache, clearUserSessions } from "../../services/redis/sessionCache.js";

export const changePassword = asyncHandler(async (req, res) => {
    const { userId, username } = req?.user;
    if (!userId) {
        throw new ApiError(statusCode.UNAUTHORIZED, "User not logged in");
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new ApiError(statusCode.BAD_REQUEST, "Current password and new password are required");
    }

    const user = await User.findById(userId).select("password");

    if (!user || !(await user.verifyPassword(currentPassword))) {
        throw new ApiError(statusCode.PASSWORD_MISMATCH, "Old password is incorrect");
    }

    // Hash new password
    user.password = newPassword;
    await user.save();

    // Invalidate all sessions for this user (security)
    await Session.updateMany({ userId }, {
        $unset: { refreshToken: 1 },
        $set: { loggedOutOn: Date.now() }
    });

    // Fetch all sessionIds for this user
    const sessionIds = await Session.find({ userId }).select("sessionId");
    // Delete all sessions from Redis
    await Promise.all(
        sessionIds.map(async (s) => {
            await delSessionCache(userId, s.sessionId);
        })
    );
    await clearUserSessions(username);

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(statusCode.OK, "Password changed successfully"));
});
