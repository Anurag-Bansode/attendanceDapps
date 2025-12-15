import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

const DB_DIR = path.join(process.cwd(), 'db');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}


export class PersistentStore extends Map {
  constructor(filename, { saveDebounce = 1000 } = {}) {
    super();
    this.filePath = path.join(DB_DIR, filename);
    this.saveDebounce = saveDebounce;
    this.saveTimeout = null;

    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const entries = JSON.parse(data);
        for (const [key, value] of entries) {
          super.set(key, value);
        }
        logger.info(`Store loaded from ${this.filePath}`);
      }
    } catch (error) {
      logger.error(`Failed to load store from ${this.filePath}`, error);
    }
  }

  _scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => this._save(), this.saveDebounce);
  }

  _save() {
    try {
      const entries = Array.from(this.entries());
      const data = JSON.stringify(entries, null, 2);
      fs.writeFileSync(this.filePath, data, 'utf-8');
      logger.info(`Store saved to ${this.filePath}`);
    } catch (error) {
      logger.error(`Failed to save store to ${this.filePath}`, error);
    }
  }

  set(key, value) {
    const result = super.set(key, value);
    this._scheduleSave();
    return result;
  }

  delete(key) {
    const result = super.delete(key);
    this._scheduleSave();
    return result;
  }
}