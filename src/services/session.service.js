const sessions = require("../stores/session.store");

function createSession(sessionId, durationMinutes) {
  if (sessions.has(sessionId)) {
    throw new Error("Session already exists");
  }

  const now = Date.now();
  sessions.set(sessionId, {
    status: "ACTIVE",
    startTime: now,
    endTime: now + durationMinutes * 60 * 1000
  });
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function autoCloseSessions() {
  const now = Date.now();
  for (const s of sessions.values()) {
    if (s.status === "ACTIVE" && now > s.endTime) {
      s.status = "CLOSED";
    }
  }
}

module.exports = { createSession, getSession, autoCloseSessions };
