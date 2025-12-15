import winston from 'winston';
import path from 'path';
import { LOG_DIR, ENV, ENABLE_LOGS } from '../config.js';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json, errors } = format;

// Custom format for logging to the console and files
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  
  // Only stringify if there's metadata to avoid empty {}
  if (metadata && Object.keys(metadata).length) {

    if (metadata.stack) {
      msg += `\n${metadata.stack}`;
    } else {
      msg += JSON.stringify(metadata);
    }
  }
  return msg;
});

const loggerTransports = [];

// In development, we log to the console with colors for readability.
if (ENV !== 'production') {
  loggerTransports.push(
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  );
}

// For file logging, we use a more structured format.
// This is asynchronous and won't block the event loop.
if (ENABLE_LOGS === 'true') {
  loggerTransports.push(
    new transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: combine(timestamp(), json(), errors({ stack: true })),
    }),
    new transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      format: combine(timestamp(), json(), errors({ stack: true })),
    })
  );
}

export const logger = createLogger({
  level: 'info', 
  format: combine(errors({ stack: true })),
  transports: loggerTransports,
  exitOnError: false,
});