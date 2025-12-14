const express = require("express");
const nonceStore = require("../stores/nonce.store");
const { getSession } = require("../services/session.service");
const { markAttendance } = require("../services/attendance.service");
const { getDeviceId } = require("../utils/device.util");

const router = express.Router();

router.post("/", (req, res) => {
  const { nonce } = req.body;
  const record = nonceStore.get(nonce);

  if (!record) {
    return res.status(400).json({ error: "Invalid QR" });
  }

  const { sessionId, expiresAt } = record;
  const s = getSession(sessionId);

  if (!s || s.status !== "ACTIVE" || Date.now() > expiresAt) {
    nonceStore.delete(nonce);
    return res.status(400).json({ error: "Expired or inactive" });
  }

  const deviceId = getDeviceId(req);

  try {
    nonceStore.delete(nonce);
    markAttendance(sessionId, deviceId);

    res.json({
      success: true,
      sessionId,
      message: "Attendance recorded"
    });
  } catch (err) {
    nonceStore.delete(nonce);
    res.status(409).json({ error: err.message });
  }
});

module.exports = router;
