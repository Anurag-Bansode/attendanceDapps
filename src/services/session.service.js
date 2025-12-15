import sessionStore from "../stores/session.store.js";
import { logger } from "../utils/logger.js"; // Added this line

export function createSession(sessionId, durationMinutes) {
  logger.info("Attempting to create session", { sessionId, durationMinutes }); // Added this log
  const now = Date.now();

  if (sessionStore.has(sessionId)) {
    logger.warn("Session creation failed: Session already exists", { sessionId }); // Added this log
    throw new Error("Session already exists");
  }

  sessionStore.set(sessionId, {
    status: "ACTIVE",
    startTime: now,
    endTime: now + durationMinutes * 60 * 1000
  });
  logger.info("Session created successfully", { sessionId, durationMinutes }); // Added this log
}

export function getSession(sessionId) {
  logger.info("Attempting to retrieve session", { sessionId }); // Added this log
  const session = sessionStore.get(sessionId);
  if (session) {
    logger.info("Session retrieved successfully", { sessionId, status: session.status }); // Added this log
  } else {
    logger.info("Session not found", { sessionId }); // Added this log
  }
  return session;
}
