import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../../utils/index.js"
import { User } from "../../../models/user.model.js"
import { setUserCache } from "../../../services/redis/userCache.js";
import { getActiveSessionCount } from "../../../services/redis/sessionCache.js";
import { generateOTP } from "../../../services/generateOtp.js";
import { sendEmail } from "../../../services/sendEmail.js"

// get {email, password} -> verify -> set in redis -> generate otp -> send -> new req verify otp (wont work with out cache)
export const loginInfo = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(statusCode.BAD_REQUEST, "Username and password are required");
    }

    // check for active sessions more than 3 devices 
    const activeCount = await getActiveSessionCount(username);
    if (activeCount >= 3) {
        throw new ApiError(
            statusCode.FORBIDDEN,
            "User already has 3 active sessions. Please logout from another device before logging in here."
        );
    }

    const user = await User.findOne({ username }).select("password email");

    // verify password
    if (!user || !(await user.verifyPassword(password))) {
        throw new ApiError(statusCode.UNAUTHORIZED, "Authentication failed");
    }

    // generate otp
    const otp = generateOTP();
    console.log({ otp });

    // cache in redis
    const result = await setUserCache("AUTH", { email, otp });
    if (!result) {
        throw new ApiError(statusCode.CONFLICT, "Email already exists");
    }

    // Send OTP via email
    await sendEmail(email, otp);

    return res
        .status(statusCode.OK)
        .json(new ApiResponse(
            statusCode.OK,
            "OTP set "
        ));
})