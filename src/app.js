import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import errorHandler from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.router.js"
import userRouter from "./routes/user.router.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(cookieParser());

app.use(errorHandler);

app.use("/api/user", authRouter);
app.use("/api/user", userRouter);

export default app;