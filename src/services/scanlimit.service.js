import { scanLimitStore } from "../stores/scanlimit.store.js";

const MAX_SCANS_PER_SESSION = 2;

export async function checkAndIncrement(sessionId, deviceId) {
  // Since Redis stores simple values, we'll create a unique key for each session-device pair.
  const key = `${sessionId}:${deviceId}`;
  
  // INCR is an atomic operation, perfect for rate limiting.
  // It initializes to 1 if the key doesn't exist.
  const count = await scanLimitStore.client.incr(scanLimitStore._getKey(key));

  if (count >= MAX_SCANS_PER_SESSION) {
    // We can optionally set an expiry on the key so it doesn't live forever.
    // For example, expire after 1 day.
    await scanLimitStore.client.expire(scanLimitStore._getKey(key), 86400);
    return false;
  }

  return true;
}
