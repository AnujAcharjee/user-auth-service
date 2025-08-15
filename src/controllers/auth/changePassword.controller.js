import { asyncExpressHandler, AppError, ApiResponse, STATUS_CODES } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const changePassword = asyncExpressHandler(async (req, res) => {
    const { _id } = req?.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new AppError(STATUS_CODES.BAD_REQUEST, "Old password and new password are required");
    }

    const user = await User.findById(_id).select("+password");

    if (!user || !(await user.verifyPassword(oldPassword))) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(STATUS_CODES.OK)
        .json(new ApiResponse(STATUS_CODES.OK, "Password changed successfully"));
});
