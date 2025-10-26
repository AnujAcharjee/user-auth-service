import { asyncHandler, ApiError, ApiResponse, statusCode, } from "../../../utils/index.js"
import { checkBloomFilter } from "../../../services/bloom-filter.js"
import { User } from "../../../models/user.model.js";

export const checkUsername = asyncHandler(async (req, res) => {
    const { username } = req.query;
    if (!username) {
        throw new ApiError(statusCode.BAD_REQUEST, "Username is required");
    }

    // check with bloom filter
    const mayExist = checkBloomFilter(username);

    // if no
    if (!mayExist) {
        return res.status(statusCode.OK).json(new ApiResponse(statusCode.OK, "Username is available", { available: true }));
    }

    // if yes - check with DB
    const user = await User.exists({ username });

    if (!user) {
        return res.status(statusCode.OK).json(new ApiResponse(statusCode.OK, "Username is available", { available: true }));
    }
    return res.status(statusCode.OK).json(new ApiResponse(statusCode.OK, `User '${username}' already exists`, { available: false }));
});
