import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import errorHandler from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.router.js"
import profileRouter from "./routes/profile.router.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(cookieParser());

app.use(errorHandler);

app.use("/auth", authRouter);
app.use("/profile", profileRouter);

export default app;