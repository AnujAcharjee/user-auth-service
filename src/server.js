import "dotenv/config"
import app from "./app.js"
// import { createServer } from "node:http"
import mongoose from "mongoose"
import { preloadBloomFilter } from "./services/bloom-filter.js"
import { createUserIndex, restoreElasticSearch } from "./services/elasticSearch/index.js"
import { logger } from "./utils/logger.js"

if (!process.env.MONGODB_URI || !process.env.PORT) {
    console.error("Error: MONGODB_URI or PORT is not defined in environment variables.");
    process.exit(1);
}

// const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

const server = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            logger.info("Connected to MongoDB");
        })
        .catch((error) => {
            console.error("MongoDB connection error:", error);
        });

    await preloadBloomFilter();

    await createUserIndex();
    await restoreElasticSearch();

    app.listen(PORT, () => {
        logger.info(`User Service is running on port ${PORT}`);
    });
};

server();