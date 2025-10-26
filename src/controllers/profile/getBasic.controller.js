import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../utils/index.js";
import { User } from "../../models/user.model.js";
import { getUserCache } from "../../services/redis/userCache.js"


export const getBasicProfile = asyncHandler(async (req, res) => {
    let { for: username } = req.query;

    if (username) username = username.trim();

    let user = await getUserCache("PROFILE", username);

    if (!user) {
        user = await User.findOne({ username })
            .select("fullname username avatar")
            .lean();
    }

    if (!user) {
        throw new ApiError(statusCode.NOT_FOUND, "User not found");
    }

    const response = {
        fullname: user.fullname,
        username: user.username,
        avatar: user.avatar,
    };

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(statusCode.OK, "User basic profile retrieved successfully", response));
});
