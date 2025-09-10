import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;

    if (!userId) {
        throw new ApiError(statusCode.UNAUTHORIZED, "User not authenticated");
    }

    const { fullname, username } = req.body;

    const user = await User.findByIdAndUpdate(userId, { fullname, username }, { new: true });

    if (!user) {
        throw new ApiError(statusCode.NOT_FOUND, "User not found");
    }

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(statusCode.OK, "User profile updated successfully", { user }));
})