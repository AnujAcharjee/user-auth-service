import { redis } from "./config.js";
import { logger } from "../../utils/logger.js";

const AUTH_KEY = (email) => `chat:register:email:${email}`;
const PROFILE_KEY = (username) => `chat:user-profile:${username}`;
const FNG_KEY = (username) => `chat:user-fng:${username}`;

const AUTH_EXPIRY = process.env.REDIS_USER_AUTH_CACHE_EXP || 300; // 5 min
const PROFILE_EXPIRY = process.env.REDIS_USER_CACHE_EXP || 1800; // 30 min

const setUnique = async (key, value, expiry) =>
    await redis.set(key, JSON.stringify(value), "NX", "EX", expiry);

const setOver = async (key, value, expiry) =>
    await redis.set(key, JSON.stringify(value), "EX", expiry);

export async function setUserCache(topic, value) {
    console.log({value, topic});
    
    try {
        let result;

        switch (topic) {
            case "AUTH":
                result = await setUnique(AUTH_KEY(value.email), value, AUTH_EXPIRY);
                break;

            case "PROFILE":
                result = await setOver(PROFILE_KEY(value.username), value, PROFILE_EXPIRY);
                break;

            case "FNG":
                result = await setOver(FNG_KEY(value.username), value, PROFILE_EXPIRY);
                break;

            default:
                throw new Error(`Invalid topic: ${topic}`);
        }

        if (!result) {
            logger.warn({ topic, value }, `${topic} cache entry already exists`);
            return false;
        }

        return true;
    } catch (error) {
        logger.error({ error }, "setUserCache failed");
        throw error;
    }
}

export async function getUserCache(topic, index) {
    try {
        let key;

        switch (topic) {
            case "AUTH":
                key = AUTH_KEY(index);
                break;

            case "PROFILE":
                key = PROFILE_KEY(index);
                break;

            case "FNG":
                key = FNG_KEY(index);
                break;

            default:
                throw new Error(`Invalid topic: ${topic}`);
        }

        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error({ error }, "getUserCache failed");
        throw error;
    }
}

export async function delUserCache(topic, index) {
    try {
        let key;

        switch (topic) {
            case "AUTH":
                key = AUTH_KEY(index);
                break;

            case "PROFILE":
                key = PROFILE_KEY(index);
                break;

            case "FNG":
                key = FNG_KEY(index);
                break;

            default:
                throw new Error(`Invalid topic: ${topic}`);
        }

        await redis.del(key);
    } catch (error) {
        logger.error({ error }, "delUserCache failed");
        throw error;
    }
}
