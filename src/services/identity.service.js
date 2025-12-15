import crypto from "crypto";
import identityStore from "../stores/identity.store.js";
import { logger } from "../utils/logger.js"; // Added this line

export function registerIdentity(deviceId, name, email) {
  logger.info("Attempting to register identity", { deviceId, name, email }); // Added this log
  if (identityStore.has(deviceId)) {
    logger.warn("Identity registration failed: Device already registered", { deviceId }); // Added this log
    throw new Error("Device already registered");
  }

  const emailHash = crypto
    .createHash("sha256")
    .update(email.toLowerCase())
    .digest("hex");

  identityStore.set(deviceId, {
    name,
    emailHash,
    createdAt: Date.now()
  });
  logger.info("Identity registered successfully", { deviceId, name, emailHash }); // Added this log
}

export function getIdentity(deviceId) {
  logger.info("Attempting to retrieve identity", { deviceId }); // Added this log
  const identity = identityStore.get(deviceId);
  if (identity) {
    logger.info("Identity retrieved successfully", { deviceId, emailHash: identity.emailHash }); // Added this log
  } else {
    logger.info("Identity not found for device", { deviceId }); // Added this log
  }
  return identity;
}
