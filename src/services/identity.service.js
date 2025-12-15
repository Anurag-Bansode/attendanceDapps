import crypto from "crypto";
import identityStore from "../stores/identity.store.js";
import { logger } from "../utils/logger.js"; 

export function registerIdentity(deviceId, name, email) {
  logger.info("Attempting to register identity", { deviceId, name, email }); 
  if (identityStore.has(deviceId)) {
    logger.warn("Identity registration failed: Device already registered", { deviceId }); 
    throw new Error("Device already registered");
  }

  identityStore.set(deviceId, {
    name,
    email: email.toLowerCase(),
    createdAt: Date.now()
  });
  logger.info("Identity registered successfully", { deviceId, name }); 
}

export function getIdentity(deviceId) {
  logger.info("Attempting to retrieve identity", { deviceId }); 
  const identity = identityStore.get(deviceId);
  if (identity) {
    logger.info("Identity retrieved successfully", { deviceId }); 
  } else {
    logger.info("Identity not found for device", { deviceId }); 
  }
  return identity;
}

export function getAllIdentities() {
  logger.info("Retrieving all identities");
  const all = {};
  for (const [deviceId, identity] of identityStore.entries()) {
    all[deviceId] = identity;
  }
  return all;
}
