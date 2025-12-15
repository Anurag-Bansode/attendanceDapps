import express from "express";
import { createSession } from "../services/session.service.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.post("/session", (req, res) => {
  const { workshop, day, session, duration_minutes } = req.body;
  const sessionId = `${workshop}-D${day}-S${session}`;

  try {
    createSession(sessionId, duration_minutes);
    logger.info("Session created", { sessionId });
    res.json({ success: true, sessionId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
