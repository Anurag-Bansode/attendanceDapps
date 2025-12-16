import sessionStore from "../stores/session.store.js";
import { logger } from "../utils/logger.js"; 

export async function createSession(sessionId, durationMinutes) {
  logger.info("Attempting to create session", { sessionId, durationMinutes });
  const now = Date.now();

  if (await sessionStore.has(sessionId)) {
    logger.warn("Session creation failed: Session already exists", { sessionId });
    throw new Error("Session already exists");
  }

  await sessionStore.set(sessionId, {
    status: "ACTIVE",
    startTime: now,
    endTime: now + durationMinutes * 60 * 1000
  });
  logger.info("Session created successfully", { sessionId, durationMinutes });
}

export async function getSession(sessionId) {
  logger.info("Attempting to retrieve session", { sessionId });
  const session = await sessionStore.get(sessionId);
  if (session) {
    logger.info("Session retrieved successfully", { sessionId, status: session.status });
  } else {
    logger.info("Session not found", { sessionId });
  }
  return session;
}
