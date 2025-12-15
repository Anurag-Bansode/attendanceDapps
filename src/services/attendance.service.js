import attendance from "../stores/attendance.store.js";
import deviceStore from "../stores/device.store.js";

export function markAttendance(sessionId, deviceId) {
  if (!deviceStore.has(sessionId)) {
    deviceStore.set(sessionId, new Set());
  }

  const devices = deviceStore.get(sessionId);

  if (devices.has(deviceId)) {
    throw new Error("Device already scanned for this session");
  }

  devices.add(deviceId);

  if (!attendance.has(sessionId)) {
    attendance.set(sessionId, []);
  }

  attendance.get(sessionId).push({
    deviceId,
    at: Date.now()
  });
}

export function summary() {
  const out = {};
  for (const [k, v] of attendance.entries()) {
    out[k] = v.length;
  }
  return out;
}
