import nonceStore from "../stores/nonce.store.js";
import sessionStore from "../stores/session.store.js";
import { logger } from "./logger.js";

export function startSchedulers() {
  setInterval(async () => {
    const now = Date.now();

    for (const [nonce, data] of await nonceStore.entries()) {
      if (data.expiresAt <= now) {
        await nonceStore.delete(nonce);
        logger.info("Nonce expired", { nonce });
      }
    }
  }, 1000);

  setInterval(async () => {
    const now = Date.now();
    for (const [id, session] of await sessionStore.entries()) {
      if (session.status === "ACTIVE" && now > session.endTime) {
        await sessionStore.set(id, { ...session, status: "CLOSED" });
        logger.info("Session closed", { sessionId: id });
      }
    }
  }, 5000);
}
