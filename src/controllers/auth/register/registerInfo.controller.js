import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../../utils/index.js"
import { User } from "../../../models/user.model.js"
import { setUserCache } from "../../../services/redis/userCache.js";
import { hashPassword } from "../../../services/bcrypt.js";
import { generateOTP } from "../../../services/generateOtp.js";
import { sendEmail } from "../../../services/sendEmail.js"

export const registerInfo = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
        throw new ApiError(statusCode.BAD_REQUEST, "All fields are required.");
    }

    // Check if email already exists in DB
    const isExistingEmail = await User.exists({ email });
    if (isExistingEmail) {
        throw new ApiError(statusCode.CONFLICT, "Email already exists.");
    }

    // Check if username exist in DB
    const isExistingUsername = await User.exists({ username });
    if (isExistingUsername) {
        throw new ApiError(statusCode.CONFLICT, "Username already exists.");
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // generate otp
    const otp = generateOTP();
    console.log({ otp });

    // cache user in redis
    const result = await setUserCache("AUTH", { fullname, username, email, password: hashedPassword, otp });
    if (!result) {
        throw new ApiError(statusCode.CONFLICT, "OTP already sent to this email. Try again after 5 mins.");
    }

    // Send OTP via email
    await sendEmail(email, otp);

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(
            statusCode.OK,
            "OTP set "
        ));
});
