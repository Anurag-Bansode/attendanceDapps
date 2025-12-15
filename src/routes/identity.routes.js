import express from "express";
import { registerIdentity } from "../services/identity.service.js";
import { getDeviceId } from "../utils/device.util.js";
import { logAudit } from "../utils/csvlogger.util.js";
import { logger } from "../utils/logger.js"; 
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

router.post("/register", asyncHandler((req, res, next) => {
  const { name, email } = req.body;
  const deviceId = getDeviceId(req, res);

  logger.info("Received registration request", { name, email, deviceId }); 

  if (!name || !email) {
    return next(new AppError("Name and email required", 400));
  }

  let registrationStatus = 'newly_registered';
  try {
    registerIdentity(deviceId, name, email);
  } catch (e) {

    if (e.message === "Device already registered") {
      logger.info("Attempt to re-register an existing device. Allowing user to proceed.", { deviceId });
      registrationStatus = 'already_registered';
    } else {
      return next(new AppError(e.message, 409));
    }
  }

  logAudit(
    "INFO",
    "IDENTITY_REGISTERED",
    null,
    deviceId,
    "New device identity created"
  );
  logger.info("Identity registered successfully", { name, email, deviceId }); 

  res.json({ success: true, status: registrationStatus });
}));

export default router;
