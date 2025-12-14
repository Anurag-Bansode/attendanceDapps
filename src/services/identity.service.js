const crypto = require("crypto");
const identityStore = require("../stores/identity.store");

function hash(value) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function registerIdentity(deviceId, name, email) {
  if (identityStore.has(deviceId)) {
    throw new Error("Identity already registered for this device");
  }

  const identity = {
    nameHash: hash(name),
    emailHash: hash(email),
    createdAt: Date.now()
  };

  identityStore.set(deviceId, identity);
  return identity;
}

function getIdentity(deviceId) {
  return identityStore.get(deviceId);
}

module.exports = { registerIdentity, getIdentity };
