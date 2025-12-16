import { logger } from './logger.js';

/**
 * An in-memory key-value store that extends the native Map.
 * NOTE: This store is NOT persistent. Data will be lost on application restart.
 * For production, this should be replaced with a persistent data store like Redis.
 */
export class PersistentStore extends Map {
  constructor(name) {
    super();
    this.name = name;
    logger.info(`In-memory store '${this.name}' initialized. Data will not be persisted.`);
  }

  set(key, value) {
    const result = super.set(key, value);
    // In a real persistent store, this would trigger a save.
    // For this in-memory version, we do nothing extra.
    return result;
  }

  delete(key) {
    const result = super.delete(key);
    // In a real persistent store, this would trigger a delete.
    // For this in-memory version, we do nothing extra.
    return result;
  }
}