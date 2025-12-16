import Session from "../models/session.model.js";
import { logger } from "./logger.js";

export function startSchedulers() {
  // The TTL index on the Nonce model handles nonce expiration automatically.
  // No need for a nonce scheduler anymore.

  setInterval(async () => {
    const now = Date.now();
    const result = await Session.updateMany(
      { status: "ACTIVE", endTime: { $lte: now } },
      { $set: { status: "CLOSED" } }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Closed ${result.modifiedCount} expired session(s).`);
    }
  }, 5000);
}
