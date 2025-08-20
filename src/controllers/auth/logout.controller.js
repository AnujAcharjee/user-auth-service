import { asyncHandler, ApiError, ApiResponse, statusCode, COOKIE_OPTIONS_AT, COOKIE_OPTIONS_RT } from "../../utils/index.js"
import { User } from "../../models/user.model.js"

export const logout = asyncHandler(async (req, res) => {
    const { _id } = req?.user;

    if (!_id) {
        throw new ApiError(statusCode.UNAUTHORIZED, "User not logged in");
    }

    await User.findByIdAndUpdate(_id, {
        $unset: { refreshToken: 1 }
    });

    return res
        .status(statusCode.OK)
        .cookie("refreshToken", "", { ...COOKIE_OPTIONS_RT, expires: new Date(0) })
        .cookie("accessToken", "", { ...COOKIE_OPTIONS_AT, expires: new Date(0) })
        .json(new ApiResponse(statusCode.OK, "User logged out successfully"));
});
