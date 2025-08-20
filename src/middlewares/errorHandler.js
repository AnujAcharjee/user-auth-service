export default (err, req, res, next) => {
    if (err instanceof ApiError) {
        // console.log("API Error:", err);
        res.status(err.statusCode).json(err.toJSON());
    } else {
        // console.log("Unknown Error:", err);
        res.status(500).json({
            statusCode: 500,
            message: err.message || "Internal server error"
        });
    }
}