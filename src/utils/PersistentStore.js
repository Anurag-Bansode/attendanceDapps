import { logger } from './logger.js';
import redisClient from './redis.js';

/**
 * A key-value store backed by Redis.
 * It uses a prefix to namespace keys for a given store instance.
 */
export class PersistentStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.client = redisClient;
    logger.info(`Redis-backed store initialized with prefix '${this.prefix}:'`);
  }

  _getKey(key) {
    return `${this.prefix}:${key}`;
  }

  async get(key) {
    const value = await this.client.get(this._getKey(key));
    return value ? JSON.parse(value) : null;
  }

  async set(key, value) {
    // By default, Redis values are strings. We stringify objects.
    return this.client.set(this._getKey(key), JSON.stringify(value));
  }

  async has(key) {
    const result = await this.client.exists(this._getKey(key));
    return result === 1;
  }

  async delete(key) {
    return this.client.del(this._getKey(key));
  }

  /**
   * Retrieves all entries for this store.
   * NOTE: Use with caution on very large datasets.
   * @returns {Promise<Array<[string, any]>>} An array of [key, value] pairs.
   */
  async entries() {
    const keys = await this.client.keys(`${this.prefix}:*`);
    if (keys.length === 0) {
      return [];
    }

    const values = await this.client.mGet(keys);
    
    return keys.map((fullKey, index) => {
      // Strip the prefix from the key for consistency with Map.entries()
      const key = fullKey.substring(this.prefix.length + 1);
      const value = values[index];
      try {
        return [key, JSON.parse(value)];
      } catch (e) {
        logger.warn(`Could not parse JSON for key ${fullKey}`, { value });
        return [key, null];
      }
    });
  }
}