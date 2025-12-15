import { nonceStore } from "../stores/nonce.store.js";
import { sessionStore } from "../stores/session.store.js";
import { logger } from "./logger.js";

export function startSchedulers() {
  setInterval(() => {
    const now = Date.now();

    for (const [nonce, data] of nonceStore.entries()) {
      if (data.expiresAt <= now) {
        nonceStore.delete(nonce);
        logger.info("Nonce expired", { nonce });
      }
    }
  }, 1000);

  setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessionStore.entries()) {
      if (session.status === "ACTIVE" && now > session.endTime) {
        session.status = "CLOSED";
        logger.info("Session closed", { sessionId: id });
      }
    }
  }, 5000);
}
