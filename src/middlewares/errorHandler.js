import ApiError from "../utils/ApiError.js"
import { statusCode } from "../utils/statusCode.js";

export default (err, req, res, next) => {
    if (err instanceof ApiError) {
        // console.log("API Error:", err);
        res.status(err.statusCode).json(err.toJSON());
    } else {
        // console.log("Unknown Error:", err);

        // Handle MongoDB duplicate key error
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(statusCode.CONFLICT).json({
                statusCode: statusCode.CONFLICT,
                message: `${field} already exists`,
            });
        }

        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(statusCode.BAD_REQUEST).json({
                statusCode: statusCode.BAD_REQUEST,
                message: messages.join(', ')
            });
        }

        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            statusCode: statusCode.INTERNAL_SERVER_ERROR,
            message: err.message || "Internal server error"
        });
    }
}