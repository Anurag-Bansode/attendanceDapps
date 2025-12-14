const express = require("express");
const nonceStore = require("../stores/nonce.store");
const { getDeviceId } = require("../utils/device.util");
const { getIdentity } = require("../services/identity.service");

const router = express.Router();

router.get("/", (req, res) => {
  const { nonce } = req.query;

  if (!nonce || !nonceStore.has(nonce)) {
    return res.status(400).send("Invalid or expired QR");
  }

  const deviceId = getDeviceId(req, res);
  const identity = getIdentity(deviceId);

  if (!identity) {
    // Not registered → show registration page
    return res.sendFile("register.html", { root: "src/public" });
  }

  // Registered → show captcha page
  return res.sendFile("captcha.html", { root: "src/public" });
});

module.exports = router;
