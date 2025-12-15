import express from "express";
import { registerIdentity } from "../services/identity.service.js";
import { getDeviceId } from "../utils/device.util.js";
import { logAudit } from "../utils/csvlogger.util.js";

const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email } = req.body;
  const deviceId = getDeviceId(req, res);

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email required" });
  }

  try {
    registerIdentity(deviceId, name, email);
    logAudit(
  "INFO",
  "IDENTITY_REGISTERED",
  null,
  deviceId,
  "New device identity created"
);

    res.json({ success: true });
  } catch (e) {
    logAudit(
  "WARN",
  "INVALID_QR",
  null,
  deviceId,
  `Nonce: ${nonce}`
);

    res.status(409).json({ error: e.message });
  }

});

export default router;
