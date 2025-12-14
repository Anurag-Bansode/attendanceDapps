const express = require("express");
const { getDeviceId } = require("../utils/device.util");
const { registerIdentity } = require("../services/identity.service");

const router = express.Router();

router.post("/register", (req, res) => {
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);
    
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email required" });
  }

  const deviceId = getDeviceId(req, res);

  try {
    registerIdentity(deviceId, name, email);
    res.json({ success: true });
  } catch (e) {
    res.status(409).json({ error: e.message });
  }
});

module.exports = router;
