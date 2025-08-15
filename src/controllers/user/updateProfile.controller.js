import { asyncExpressHandler, AppError, ApiResponse, STATUS_CODES } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const updateProfile = asyncExpressHandler(async (req, res) => {
    const userId = req?.user?._id;

    if (!userId) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const { fullname, username } = req.body;

    const user = await User.findByIdAndUpdate(userId, { fullname, username }, { new: true });

    if (!user) {
        throw new AppError(STATUS_CODES.NOT_FOUND, "User not found");
    }

    return res
        .status(STATUS_CODES.OK)
        .json(new ApiResponse(STATUS_CODES.OK, "User profile updated successfully", { user }));
})