import fs from "fs";
import path from "path";
import { ENABLE_LOGS, LOG_DIR } from "../config.js";
import { console } from "inspector";

const attendanceFile = path.join(LOG_DIR, "attendance.csv");
const auditFile = path.join(LOG_DIR, "audit_log.csv");

console.log(attendanceFile)
console.log(auditFile)

function ensureFile(file, header) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, header + "\n");
  }
}

if (ENABLE_LOGS) {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

  ensureFile(
    attendanceFile,
    "timestamp,session_id,device_id,name,email"
  );

  ensureFile(
    auditFile,
    "timestamp,level,action,session_id,device_id,details"
  );
}

function writeLine(file, values) {
  fs.appendFileSync(file, values.join(",") + "\n");
}


export function logAttendance(sessionId, deviceId, name, email) {
  if (!ENABLE_LOGS) return;

  writeLine(attendanceFile, [
    new Date().toISOString(),
    sessionId,
    deviceId,
    // Sanitize by wrapping in quotes
    `"${name.replace(/"/g, '""')}"`,
    email
  ]);
}

export function logAudit(level, action, sessionId, deviceId, details = "") {
  if (!ENABLE_LOGS) return;

  writeLine(auditFile, [
    new Date().toISOString(),
    level,
    action,
    sessionId || "",
    deviceId || "",
    `"${details}"`
  ]);
}
