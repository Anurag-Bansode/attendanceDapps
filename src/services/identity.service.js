import crypto from "crypto";
import identityStore from "../stores/identity.store.js";
import { logger } from "../utils/logger.js"; 

export async function registerIdentity(deviceId, name, email) {
  logger.info("Attempting to register identity", { deviceId, name, email }); 
  if (await identityStore.has(deviceId)) {
    logger.warn("Identity registration failed: Device already registered", { deviceId }); 
    throw new Error("Device already registered");
  }

  await identityStore.set(deviceId, {
    name,
    email: email.toLowerCase(),
    createdAt: Date.now()
  });
  logger.info("Identity registered successfully", { deviceId, name }); 
}

export async function getIdentity(deviceId) {
  logger.info("Attempting to retrieve identity", { deviceId }); 
  const identity = await identityStore.get(deviceId);
  if (identity) {
    logger.info("Identity retrieved successfully", { deviceId }); 
  } else {
    logger.info("Identity not found for device", { deviceId }); 
  }
  return identity;
}

export async function getAllIdentities() {
  logger.info("Retrieving all identities");
  const all = {};
  for (const [deviceId, identity] of await identityStore.entries()) {
    all[deviceId] = identity;
  }
  return all;
}
