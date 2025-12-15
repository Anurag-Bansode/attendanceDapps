import express from "express";
import { logger } from "../utils/logger.js";
import { checkAndIncrement } from "../services/scanlimit.service.js";
import { getDeviceId } from "../utils/device.util.js";
import nonceStore from "../stores/nonce.store.js";
import attendanceStore from "../stores/attendance.store.js";
import { logAttendance, logAudit } from "../utils/csvlogger.util.js";
import { getIdentity } from "../services/identity.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

router.post("/", asyncHandler((req, res, next) => {
  const { nonce } = req.body;
  const deviceId = getDeviceId(req, res);

  logger.info("Received scan request", { nonce, deviceId }); 

  if (!nonceStore.has(nonce)) {
    return next(new AppError("Invalid or expired QR", 400));
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
    return next(new AppError("Too many scan attempts", 429));
  }

  if (!attendanceStore.has(sessionId)) {
    attendanceStore.set(sessionId, []);
  }
  const identity = getIdentity(deviceId);
  const hasAlreadyAttended = attendanceStore.get(sessionId)?.some(att => att.deviceId === deviceId);
  if (hasAlreadyAttended) {
    logger.warn("Duplicate attendance attempt blocked", { sessionId, deviceId });
    return next(new AppError("Attendance already recorded for this device", 409));
  }
  attendanceStore.get(sessionId).push({
    deviceId,
    scannedAt: Date.now()
  });
  logAttendance(
    sessionId,
    deviceId,
    identity.name,
    identity.email
  );
  logAudit(
    "INFO",
    "ATTENDANCE_RECORDED",
    sessionId,
    deviceId
  );
  logger.info("Attendance recorded", { sessionId, deviceId });
  res.json({ success: true });
}));

export default router;
