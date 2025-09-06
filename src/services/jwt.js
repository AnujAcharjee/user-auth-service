import jwt from "jsonwebtoken";

const generateAccessToken = function () {
    return jwt.sign(
        { userId: this._id, username: this.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXP }
    )
}

const generateRefreshToken = function () {
    return jwt.sign(
        { userId: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXP }
    )
}

const verifyToken = function (token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export { generateAccessToken, generateRefreshToken, verifyToken };