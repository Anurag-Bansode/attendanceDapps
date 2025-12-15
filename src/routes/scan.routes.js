import express from "express";
import { logger } from "../utils/logger.js";
import { checkAndIncrement } from "../services/scanlimit.service.js";
import { getDeviceId } from "../utils/device.util.js";
import nonceStore from "../stores/nonce.store.js";
import attendanceStore from "../stores/attendance.store.js";
import { logAttendance, logAudit } from "../utils/csvlogger.util.js";
import { getIdentity } from "../services/identity.service.js";


const router = express.Router();

router.post("/", (req, res) => {
  const { nonce } = req.body;
  const deviceId = getDeviceId(req, res);

  if (!nonceStore.has(nonce)) {
    logger.warn("Invalid or expired nonce", { nonce, deviceId });
    return res.status(400).json({ error: "Invalid or expired QR" });
  }

  const { sessionId } = nonceStore.get(nonce);

  if (!checkAndIncrement(sessionId, deviceId)) {
    logger.warn("Rate limit exceeded", { sessionId, deviceId });
    logAudit(
      "WARN",
      "RATE_LIMIT_EXCEEDED",
      sessionId,
      deviceId,
      "More than 2 scan attempts"
    );
    return res.status(429).json({ error: "Too many scan attempts" });
  }

  nonceStore.delete(nonce);

  if (!attendanceStore.has(sessionId)) {
    attendanceStore.set(sessionId, []);
  }

  const identity = getIdentity(deviceId);

  attendanceStore.get(sessionId).push({
    deviceId,
    scannedAt: Date.now()
  });

  logAttendance(
    sessionId,
    deviceId,
    identity.emailHash
  );

  logAudit(
    "INFO",
    "ATTENDANCE_RECORDED",
    sessionId,
    deviceId
  );

  logger.info("Attendance recorded", { sessionId, deviceId });

  res.json({ success: true });
});

export default router;
