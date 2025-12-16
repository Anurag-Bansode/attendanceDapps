import express from "express";
import { logger } from "../utils/logger.js";
import { checkAndIncrement } from "../services/scanlimit.service.js";
import { markAttendance } from "../services/attendance.service.js";
import { getDeviceId } from "../utils/device.util.js";
import Nonce from "../models/nonce.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

router.post("/", asyncHandler(async (req, res, next) => {
  const { nonce } = req.body;
  const deviceId = getDeviceId(req, res);

  logger.info("Received scan request", { nonce, deviceId }); 

  const nonceDoc = await Nonce.findById(nonce);
  if (!nonceDoc) {
    return next(new AppError("Invalid or expired QR", 400));
  }

  const { sessionId } = nonceDoc;

  if (!(await checkAndIncrement(sessionId, deviceId))) {
    logger.warn("Rate limit exceeded", { sessionId, deviceId });
    return next(new AppError("Too many scan attempts", 429));
  }

  try {
    await markAttendance(sessionId, deviceId);
    logger.info("Attendance recorded", { sessionId, deviceId });
    res.json({ success: true });
  } catch (error) {
    if (error.message.includes("Device already scanned")) {
      return next(new AppError("Attendance already recorded for this device", 409));
    }
    return next(error);
  }
}));

export default router;
