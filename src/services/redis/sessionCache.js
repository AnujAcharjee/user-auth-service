import { redis } from "./config.js";
import { logger } from "../../utils/logger.js";

const SESSION_KEY = (sessionId) => `chat:session:${sessionId}`;
const ACTIVE_SESSION_KEY = (username) => `chat:active-sessions:${username}`;

// Create session - register validate | login validate
export async function setSessionCache(username, sessionId, refreshToken) {
    if (!username || !sessionId || !refreshToken)
        throw new Error('setSessionCache:: params missing')

    const VALUE = {
        username,
        refreshToken,
        gateway: null,
    };
    const EXPIRY = Number(process.env.REDIS_SESSION_CACHE_EXP); // 30 days - same as refresh token

    try {
        const result = await redis.set(
            SESSION_KEY(sessionId),
            JSON.stringify(VALUE),
            "NX",  // NX ensures the key is only set if it does not already exist
            "EX",
            EXPIRY
        ); // result: "OK" | null

        if (!result) {
            // Key already exists
            logger.warn({ sessionId }, "Session already exists, skipping set");
            return false;
        }

        // user: active sessionIds (SET) , max 3
        await redis.sadd(ACTIVE_SESSION_KEY(username), sessionId);

        return true;
    } catch (error) {
        logger.error({ error }, "setSessionCache failed");
        throw error;
    }
}

// Delete session - logout
export async function delSessionCache(username, sessionId) {
    try {
        // Delete session info
        await redis.del(SESSION_KEY(sessionId));
        // remove from active set
        await redis.srem(ACTIVE_SESSION_KEY(username), sessionId);
    } catch (error) {
        logger.error({ error }, "delSessionCache failed");
        throw error;
    }
}

// Get the number of active sessions for a user - login info
export async function getActiveSessionCount(username) {
    try {
        const count = await redis.scard(ACTIVE_SESSION_KEY(username)); // returns integer count
        return count;
    } catch (error) {
        logger.error({ error }, "getActiveSessionCount failed");
        throw error;
    }
}

// Delete all sessions for a user
export async function clearUserSessions(username) {
    try {
        const activeSessions = await redis.smembers(ACTIVE_SESSION_KEY(username));

        if (activeSessions.length > 0) {
            // Delete each associated session key
            const deleteKeys = activeSessions.map((sid) => SESSION_KEY(sid));
            await redis.del(...deleteKeys);
        }

        // Finally delete the active session set itself
        await redis.del(ACTIVE_SESSION_KEY(username));
    } catch (error) {
        logger.error({ error }, "clearUserSessions failed");
        throw error;
    }
}



