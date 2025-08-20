import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const profile = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;

    if (!userId) {
        throw new ApiError(statusCode.UNAUTHORIZED, "User not authenticated");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(statusCode.NOT_FOUND, "User not found");
    }

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(statusCode.OK, "User profile retrieved successfully", { user }));
})