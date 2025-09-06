import mongoose from "mongoose"
import { hashPassword, verifyPassword } from "../services/bcrypt.js"
import { generateAccessToken, generateRefreshToken } from "../services/jwt.js"

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            index: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            index: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },

        chatGroups: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Room',
            }
        ]
    },
    { timestamps: true }
);

userSchema.pre("save", hashPassword);

userSchema.methods.verifyPassword = verifyPassword;
userSchema.methods.generateAccessToken = generateAccessToken;
userSchema.methods.generateRefreshToken = generateRefreshToken;

export const User = mongoose.model("User", userSchema);