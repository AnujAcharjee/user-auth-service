import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const changePassword = asyncHandler(async (req, res) => {
    const { _id } = req?.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(statusCode.BAD_REQUEST, "Current password and new password are required");
    }

    const user = await User.findById(_id).select("+password");

    if (!user || !(await user.verifyPassword(currentPassword))) {
        throw new ApiError(statusCode.PASSWORD_MISMATCH, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(statusCode.OK, "Password changed successfully"));
});
