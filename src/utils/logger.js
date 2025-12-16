import winston from 'winston';
import { NODE_ENV } from '../config.js';
import MongoTransport from './mongo.transport.js';

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
if (NODE_ENV !== 'production') {
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

// Always log to MongoDB
loggerTransports.push(new MongoTransport({
  level: 'info',
}));

// In production, we log to the console in a structured JSON format.
if (NODE_ENV === 'production') {
  loggerTransports.push(
    new transports.Console({
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