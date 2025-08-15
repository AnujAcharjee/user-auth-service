import { asyncExpressHandler, AppError, ApiResponse, STATUS_CODES } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const profile = asyncExpressHandler(async (req, res) => {
    const userId = req?.user?._id;

    if (!userId) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new AppError(STATUS_CODES.NOT_FOUND, "User not found");
    }

    return res
        .status(STATUS_CODES.OK)
        .json(new ApiResponse(STATUS_CODES.OK, "User profile retrieved successfully", { user }));
})