import express from "express";
import nonceStore from "../stores/nonce.store.js";
import { getDeviceId } from "../utils/device.util.js";
import { getIdentity } from "../services/identity.service.js";
import { logger } from "../utils/logger.js"; 

const router = express.Router();

router.get("/", (req, res) => {
  const { nonce } = req.query;
  const deviceId = getDeviceId(req, res); 

  logger.info("Received checkin request", { nonce, deviceId }); 

  if (!nonce || !nonceStore.has(nonce)) {
    logger.warn("Checkin failed: Invalid or missing nonce", { nonce, deviceId }); 
    return res.sendFile("error.html", { root: "src/public" });
  }

  const { sessionId, expiresAt } = nonceStore.get(nonce);
  const identity = getIdentity(deviceId);

  if (!identity) {
    logger.info("Identity not found for device, redirecting to registration", { deviceId, sessionId }); 
    return res.redirect(
      `/register.html?nonce=${nonce}&session=${sessionId}&expiresAt=${expiresAt}`
    );
  }

  logger.info("Checkin successful, redirecting to captcha", { deviceId, sessionId }); 
  return res.redirect(
    `/captcha.html?nonce=${nonce}&session=${sessionId}&expiresAt=${expiresAt}`
  );
});

export default router;
