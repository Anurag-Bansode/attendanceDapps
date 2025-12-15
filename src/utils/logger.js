import fs from "fs";
import path from "path";
import { ENABLE_LOGS, LOG_DIR } from "../config.js";

if (ENABLE_LOGS && !fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

function write(type, message, meta = {}) {
  if (!ENABLE_LOGS) return;

  const entry = {
    time: new Date().toISOString(),
    level: type,
    message,
    ...meta
  };

  fs.appendFileSync(
    path.join(LOG_DIR, "attendance.log"),
    JSON.stringify(entry) + "\n"
  );
}

export const logger = {
  info: (msg, meta) => write("INFO", msg, meta),
  warn: (msg, meta) => write("WARN", msg, meta),
  error: (msg, meta) => write("ERROR", msg, meta)
};
