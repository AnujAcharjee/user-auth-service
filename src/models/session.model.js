import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    deviceName: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    loggedInOn: {
        type: Date,
        default: Date.now,
    },
    loggedOutOn: {
        type: Date,
        default: null,
    },
    refreshToken: {
        type: String,
        default: '',
        trim: true,
    },
});

export const Session = mongoose.model("Session", sessionSchema);
