import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../utils/index.js";
import { User } from "../../models/user.model.js";
import { setUserCache, getUserCache } from "../../services/redis/userCache.js"

export const getProfile = asyncHandler(async (req, res) => {
    let { for: username } = req.query;

    if (username) username = username.trim();

    let user;

    // no username try DB
    if (!username) {
        const userId = req?.user?._id;
        if (!userId) {
            throw new ApiError(statusCode.UNAUTHORIZED, "User not authenticated");
        }

        user = await User.findById(userId)
            .select("-password -refreshToken -friends -groups")
            .lean();

        // set in redis
        if (user) await setUserCache("PROFILE", user);

    } else {
        // try from redis first
        user = await getUserCache("PROFILE", username);

        // then DB
        if (!user) {
            user = await User.findOne({ username })
                .select("-password -refreshToken -chatFriends -chatGroups")
                .lean();

            // set in redis
            if (user) await setAndUpdateUserProfileCache(user);
        }
    }

    if (!user) {
        throw new ApiError(statusCode.NOT_FOUND, "User not found");
    }

    const response = {
        user: {
            userId: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
    };

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(statusCode.OK, "User profile retrieved successfully", response));
});
