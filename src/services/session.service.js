import sessionStore from "../stores/session.store.js";

export function createSession(sessionId, durationMinutes) {
  const now = Date.now();

  if (sessionStore.has(sessionId)) {
    throw new Error("Session already exists");
  }

  sessionStore.set(sessionId, {
    status: "ACTIVE",
    startTime: now,
    endTime: now + durationMinutes * 60 * 1000
  });
}

export function getSession(sessionId) {
  return sessionStore.get(sessionId);
}
