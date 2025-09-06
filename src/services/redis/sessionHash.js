import { redis } from "./config.js";
import { logger } from "../../utils/logger.js"

const KEY = "chat:sessions";

export async function addSessionHash(username, sessionId) {
    const FIELD = username;

    try {
        const existing = await redis.hget(KEY, FIELD);
        const sessions = existing ? JSON.parse(existing) : {};

        sessions[sessionId] = null;

        await redis.hset(KEY, FIELD, JSON.stringify(sessions));
    } catch (error) {
        logger.error({ error }, "toggleSessionHash failed");
        throw error;
    }
}

export async function delSessionHash(username, sessionId) {
    const FIELD = username;

    try {
        const existing = await redis.hget(KEY, FIELD);
        if (!existing) return;

        const sessions = JSON.parse(existing);
        delete sessions[sessionId];

        if (Object.keys(sessions).length) {
            await redis.hset(KEY, username, JSON.stringify(sessions));
        } else {
            await redis.hdel(KEY, username); 
        }
    } catch (error) {
        logger.error({ error }, "toggleSessionHash failed");
        throw error;
    }
}