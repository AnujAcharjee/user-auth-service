import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP; // Default to 30 minutes if not set
const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP; // Default to 7 days if not set
const JWT_SECRET = process.env.JWT_SECRET; // Default secret if not set

if (!JWT_SECRET || !ACCESS_TOKEN_EXP || !REFRESH_TOKEN_EXP) {
    throw new Error("JWT environment variables are not properly set");
}

export const generateAccessToken = function (sessionId) {
    return jwt.sign(
        { userId: this._id, username: this.username, sessionId },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXP }
    )
}

export const generateRefreshToken = function (sessionId) {
    return jwt.sign(
        { userId: this._id, username: this.username, sessionId },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXP }
    )
}

export const verifyToken = function (token) {
    return jwt.verify(token, JWT_SECRET);
}