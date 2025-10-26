import pkg from "bloom-filters"; // bloom-filters is a CommonJS module
const { ScalableBloomFilter } = pkg;
import { User } from "../models/user.model.js";
import { logger } from "../utils/logger.js";

let filter;

// Singleton
export const getBloomFilter = () => {
    if (!filter) {
        filter = new ScalableBloomFilter(1000, 0.01); // cap=1000, error=1%
    }
    return filter;
}

// Check if username may exist
export function checkBloomFilter(username) {
    const _filter = getBloomFilter();
    return _filter.has(username);
    // true → may exist
    // false → definitely not exist
}

// Add username to filter
export function addBloomFilter(username) {
    getBloomFilter().add(username);
}

// Preload from DB in batches
export async function preloadBloomFilter(batchSize = 1000) {
    const _filter = getBloomFilter();
    let skip = 0;
    let added = 0;

    // Add reserved usernames first
    const RESERVED_USERNAMES = ["login", "signup", "settings", "message", "admin"];
    RESERVED_USERNAMES.forEach(name => _filter.add(name));
    added += RESERVED_USERNAMES.length;

    while (true) {
        const users = await User.find({}, "username").skip(skip).limit(batchSize).lean();
        if (users.length === 0) break;

        users.forEach(u => _filter.add(u.username));
        added += users.length;
        skip += batchSize;
    }

    logger.info(`Bloom filter preloaded with ${added} users (including reserved usernames)`);
}
