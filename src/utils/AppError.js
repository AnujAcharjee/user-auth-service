class AppError extends Error {
    constructor(
        statusCode,
        message = "Internal server error",
        errors = [],
        stack = '',
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            data: this.data
        };
    }
}

export default AppError;