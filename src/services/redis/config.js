import Redis from "ioredis";
import { logger } from "../../utils/logger.js"

const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;

if (!REDIS_HOST || !REDIS_PORT || !REDIS_USERNAME || !REDIS_PASSWORD) {
    throw new Error("Missing Redis environment variables");
}

export const redis = new Redis({
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    retryStrategy: (times) => (times > 10 ? null : Math.min(times * 200, 2000)),
});

// Event listeners
["connect", "ready", "error", "close", "reconnecting"].forEach((evt) => {
    redis.on(evt, (arg) => {
        const msg = `Redis ${evt}`;
        evt === "error"
            ? logger.error({ arg }, msg)
            : logger.info({ arg }, msg);
    });
});

export async function healthCheckRedis(timeout = 1000) {
    try {
        const res = await Promise.race([
            redis.ping(),
            new Promise((_, r) =>
                setTimeout(() => r(new Error("Redis health check timeout")), timeout)
            ),
        ]);
        logger.info({ res }, "Redis health check OK");
        return true;
    } catch (err) {
        logger.error({ err }, "Redis health check failed");
        return false;
    }
}

export const shutdownRedis = () =>
    redis.quit().then(() => logger.info("Redis closed")).catch((err) =>
        logger.error({ err }, "Error closing Redis")
    );
