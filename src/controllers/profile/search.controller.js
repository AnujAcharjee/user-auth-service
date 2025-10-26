import { asyncHandler, ApiError, ApiResponse, statusCode } from "../../utils/index.js"
import { searchUsersByPrefix } from "../../services/elasticSearch/index.js"

export const search = asyncHandler(async (req, res) => {
    const { q } = req.query

    if (!q || q.trim() === "") {
        throw new ApiError(statusCode.BAD_REQUEST, "Query parameter 'q' is required")
    }

    const searchResult = await searchUsersByPrefix(q)

    return res.status(statusCode.OK).json(
        new ApiResponse(statusCode.OK, "Search results", searchResult)
    )
})
