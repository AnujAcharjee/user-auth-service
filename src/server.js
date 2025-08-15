import "dotenv/config"
import app from "./app.js"
import { createServer } from "node:http"
import mongoose from "mongoose"

const httpServer = createServer(app);

const server = () => {

    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((error) => {
            console.error("MongoDB connection error:", error);
        });

    httpServer.listen(process.env.PORT, () => {
        console.log(`User Service is running on port ${process.env.PORT}`);
    });
}

server();