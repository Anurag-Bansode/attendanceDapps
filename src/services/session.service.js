import Session from "../models/session.model.js";
import { logger } from "../utils/logger.js"; 

export async function createSession(sessionId, durationMinutes) {
  logger.info("Attempting to create session", { sessionId, durationMinutes });
  const now = Date.now();

  const existingSession = await Session.findById(sessionId);
  if (existingSession) {
    logger.warn("Session creation failed: Session already exists", { sessionId });
    throw new Error("Session already exists");
  }

  const newSession = new Session({
    _id: sessionId,
    status: "ACTIVE",
    startTime: now,
    endTime: now + durationMinutes * 60 * 1000
  });
  await newSession.save();
  logger.info("Session created successfully", { sessionId, durationMinutes });
}

export async function getSession(sessionId) {
  logger.info("Attempting to retrieve session", { sessionId });
  const session = await Session.findById(sessionId).lean();
  if (session) {
    logger.info("Session retrieved successfully", { sessionId, status: session.status });
  } else {
    logger.info("Session not found", { sessionId });
  }
  return session;
}
