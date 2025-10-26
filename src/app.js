import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import errorHandler from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.router.js"
import profileRouter from "./routes/profile.router.js"

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

const app = express();

app.use(express.json())
    .use(express.urlencoded({ extended: true }))

    .use(
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
    )

    .use(cookieParser())

    .use("/auth", authRouter)
    .use("/profile", profileRouter)

    .use(errorHandler);

export default app;