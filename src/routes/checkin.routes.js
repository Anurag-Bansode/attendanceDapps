import express from "express";
import { getDeviceId } from "../utils/device.util.js";
import { getIdentity } from "../services/identity.service.js";
import { logger } from "../utils/logger.js"; 
import asyncHandler from "../utils/asyncHandler.js";
import Nonce from "../models/nonce.model.js";

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const { nonce } = req.query;
  const deviceId = getDeviceId(req, res); 

  logger.info("Received checkin request", { nonce, deviceId }); 

  const nonceDoc = nonce ? await Nonce.findById(nonce).lean() : null;
  if (!nonceDoc) {
    logger.warn("Checkin failed: Invalid or missing nonce", { nonce, deviceId }); 
    return res.sendFile("error.html", { root: "src/public" });
  }

  const { sessionId, expiresAt } = nonceDoc;
  const identity = await getIdentity(deviceId);

  if (!identity) {
    logger.info("Identity not found for device, redirecting to registration", { deviceId, sessionId }); 
    return res.redirect(
      `/register.html?nonce=${nonce}&session=${sessionId}&expiresAt=${expiresAt.getTime()}`
    );
  }

  logger.info("Checkin successful, redirecting to captcha", { deviceId, sessionId }); 
  return res.redirect(
    `/captcha.html?nonce=${nonce}&session=${sessionId}&expiresAt=${expiresAt.getTime()}`
  );
}));

export default router;
