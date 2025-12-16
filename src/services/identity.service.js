import Identity from "../models/identity.model.js";
import { logger } from "../utils/logger.js"; 

export async function registerIdentity(deviceId, name, email) {
  logger.info("Attempting to register identity", { deviceId, name, email }); 
  const existingIdentity = await Identity.findById(deviceId);
  if (existingIdentity) {
    logger.warn("Identity registration failed: Device already registered", { deviceId }); 
    throw new Error("Device already registered");
  }

  const newIdentity = new Identity({
    _id: deviceId,
    name,
    email: email.toLowerCase(),
  });
  await newIdentity.save();
  logger.info("Identity registered successfully", { deviceId, name }); 
}

export async function getIdentity(deviceId) {
  logger.info("Attempting to retrieve identity", { deviceId }); 
  const identity = await Identity.findById(deviceId).lean();
  if (identity) {
    logger.info("Identity retrieved successfully", { deviceId }); 
  } else {
    logger.info("Identity not found for device", { deviceId });
  }
  return identity;
}

export async function getAllIdentities() {
  logger.info("Retrieving all identities");
  const identities = await Identity.find({}).lean();
  // Convert array to the object format the frontend expects
  return identities.reduce((acc, identity) => {
    acc[identity._id] = identity;
    return acc;
  }, {});
}
