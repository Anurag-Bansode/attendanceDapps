import attendance from "../stores/attendance.store.js";
import deviceStore from "../stores/device.store.js";

export async function markAttendance(sessionId, deviceId) {
  let sessionAttendance = await attendance.get(sessionId);

  if (!sessionAttendance) {
    sessionAttendance = [];
  }

  const hasAlreadyAttended = sessionAttendance.some(att => att.deviceId === deviceId);
  if (hasAlreadyAttended) {
    throw new Error("Device already scanned for this session");
  }

  sessionAttendance.push({
    deviceId,
    at: Date.now()
  });

  await attendance.set(sessionId, sessionAttendance);
}

export async function summary() {
  const out = {};
  const allEntries = await attendance.entries();
  for (const [k, v] of allEntries) {
    out[k] = v.length;
  }
  return out;
}

export async function getFullLog() {
  const log = {};
  const allEntries = await attendance.entries();
  for (const [sessionId, records] of allEntries) {
    log[sessionId] = records;
  }
  return log;
}
