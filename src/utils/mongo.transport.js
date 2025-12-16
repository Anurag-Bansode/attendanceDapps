import Transport from 'winston-transport';
import Log from '../models/log.model.js';

export default class MongoTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, ...meta } = info;

    const logEntry = new Log({ level, message, meta });

    logEntry.save().catch(err => console.error('Failed to save log to MongoDB:', err));

    callback();
  }
}