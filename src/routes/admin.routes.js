const express = require("express");
const { createSession } = require("../services/session.service");

const router = express.Router();

router.post("/session", (req, res) => {
  const { workshop, day, session, duration_minutes } = req.body;
  const sessionId = `${workshop}-D${day}-S${session}`;

  try {
    createSession(sessionId, duration_minutes);
    res.json({ success: true, sessionId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
