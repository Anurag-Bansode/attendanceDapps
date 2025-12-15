import fs from "fs";
import path from "path";

const LOG_DIR = "logs";

export function readCSV(file) {
  return fs
    .readFileSync(path.join(LOG_DIR, file), "utf-8")
    .trim()
    .split("\n")
    .slice(1); // skip header
}

export function clearLogs() {
  if (fs.existsSync(LOG_DIR)) {
    fs.rmSync(LOG_DIR, { recursive: true, force: true });
  }
}
