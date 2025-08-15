import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import authRouter from "./routes/auth.router.js"
import userRouter from "./routes/user.router.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(cookieParser());

app.use("/", authRouter);
app.use("/", userRouter);

export default app;