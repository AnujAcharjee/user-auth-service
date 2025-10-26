import { Client } from '@elastic/elasticsearch'
import { User } from '../../models/user.model.js'
import { logger } from '../../utils/logger.js'

// Elasticsearch client with password auth
export const esClient = new Client({
    node: 'http://localhost:9200',
    auth: {
        username: 'elastic',       // from ELASTIC_PASSWORD setup
        password: 'admin123'
    }
})

// Create 'users' index with mapping
export async function createUserIndex() {
    const indexName = 'users'

    try {
        // Delete if exists (optional, for testing)
        const exists = await esClient.indices.exists({ index: indexName })
        if (exists) {
            await esClient.indices.delete({ index: indexName })
        }

        // Create index with mapping
        await esClient.indices.create({
            index: indexName,
            body: {
                mappings: {
                    properties: {
                        fullname: { type: 'text', analyzer: 'standard' },
                        username: {
                            type: 'text',
                            analyzer: 'standard',
                            fields: {
                                keyword: { type: 'keyword' } // for exact match search
                            }
                        },
                        avatar: { type: 'keyword' }
                    }
                }
            }
        })

        logger.info(`Created index: ${indexName}`)
    } catch (err) {
        logger.error('Error creating index:', err)
    }
}

// Add a user document to Elasticsearch
export async function addElasticSearch(fullname, username, avatar = null) {
    try {
        await esClient.index({
            index: 'users',
            id: username, // using username as document id
            document: { fullname, username, avatar }
        })

        // Refresh so they're immediately searchable
        await esClient.indices.refresh({ index: 'users' })
        logger.debug(`Indexed user: ${username}`)
    } catch (err) {
        logger.error('Error indexing user:', err)
    }
}

// Restore users from MongoDB to Elasticsearch
export async function restoreElasticSearch() {
    try {
        const users = await User.find({}, 'username fullname avatar').lean()

        for (const user of users) {
            await addElasticSearch(user.fullname, user.username, user.avatar)
        }

        logger.info(`Restored ${users.length} users to Elasticsearch`)
    } catch (err) {
        logger.error('Error restoring users:', err)
    }
}

// Search users by username prefix
export async function searchUsersByPrefix(prefix, size = 10) {
    try {
        const { hits } = await esClient.search({
            index: 'users',
            body: {
                query: {
                    match_phrase_prefix: {
                        username: prefix
                    }
                },
                size
            }
        })

        return hits.hits.map(hit => hit._source)
    } catch (err) {
        logger.error('Error searching users:', err)
        return []
    }
}
