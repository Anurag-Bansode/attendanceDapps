import express from "express";
import { logger } from "../utils/logger.js";
import { checkAndIncrement } from "../services/scanlimit.service.js";
import { getDeviceId } from "../utils/device.util.js";
import nonceStore from "../stores/nonce.store.js";
import attendanceStore from "../stores/attendance.store.js";
import { getIdentity } from "../services/identity.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

router.post("/", asyncHandler(async (req, res, next) => {
  const { nonce } = req.body;
  const deviceId = getDeviceId(req, res);

  logger.info("Received scan request", { nonce, deviceId }); 

  if (!(await nonceStore.has(nonce))) {
    return next(new AppError("Invalid or expired QR", 400));
  }

  const { sessionId } = await nonceStore.get(nonce);

  if (!(await checkAndIncrement(sessionId, deviceId))) {
    logger.warn("Rate limit exceeded", { sessionId, deviceId });
    return next(new AppError("Too many scan attempts", 429));
  }

  const sessionAttendance = await attendanceStore.get(sessionId) || [];
  const identity = await getIdentity(deviceId);
  const hasAlreadyAttended = sessionAttendance.some(att => att.deviceId === deviceId);
  if (hasAlreadyAttended) {
    logger.warn("Duplicate attendance attempt blocked", { sessionId, deviceId });
    return next(new AppError("Attendance already recorded for this device", 409));
  }
  sessionAttendance.push({
    deviceId,
    scannedAt: Date.now()
  });
  await attendanceStore.set(sessionId, sessionAttendance);
  logger.info("Attendance recorded", { sessionId, deviceId });
  res.json({ success: true });
}));

export default router;
