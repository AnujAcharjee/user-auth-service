import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../utils/index.js";
import { User } from "../../models/user.model.js";
import { getUserCache, setUserCache } from "../../services/redis/userCache.js"

export const getFNG = asyncHandler(async (req, res) => {
    let { for: username } = req.query;

    if (username) username = username.trim();

    let fng = await getUserCache("FNG", username);

    if (!fng) {
        fng = await User.aggregate([
            // match the main user
            { $match: { username } },

            // lookup friends’ basic info
            {
                $lookup: {
                    from: "users", // collection name 
                    localField: "chatFriends",
                    foreignField: "_id",
                    as: "friends",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                fullname: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },

            // lookup groups’ basic info
            {
                $lookup: {
                    from: "groups",
                    localField: "chatGroups",
                    foreignField: "_id",
                    as: "groups",
                    pipeline: [
                        {
                            $project: {
                                groupId: 1,
                                groupname: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },

            // return only what we need
            {
                $project: {
                    friends: 1,
                    groups: 1
                }
            }
        ]);

        // set in redis
        await setUserCache("FNG", fng)

    }

    if (!fng) {
        throw new ApiError(statusCode.NOT_FOUND, "FNG not found");
    }

    const response = {
        friends: fng.friends,
        groups: fng.groups
    };

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(statusCode.OK, "FNG friends and groups retrieved successfully", response));
});
