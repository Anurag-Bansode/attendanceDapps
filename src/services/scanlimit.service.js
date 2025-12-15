import { scanLimitStore } from "../stores/scanlimit.store.js";

const MAX_SCANS_PER_SESSION = 2;

export function checkAndIncrement(sessionId, deviceId) {
  if (!scanLimitStore.has(sessionId)) {
    scanLimitStore.set(sessionId, new Map());
  }

  const sessionMap = scanLimitStore.get(sessionId);
  const count = sessionMap.get(deviceId) || 0;

  if (count >= MAX_SCANS_PER_SESSION) {
    return false;
  }

  sessionMap.set(deviceId, count + 1);
  return true;
}
