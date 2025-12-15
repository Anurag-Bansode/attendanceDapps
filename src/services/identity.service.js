import crypto from "crypto";
import identityStore from "../stores/identity.store.js";

export function registerIdentity(deviceId, name, email) {
  if (identityStore.has(deviceId)) {
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
}

export function getIdentity(deviceId) {
  return identityStore.get(deviceId);
}
