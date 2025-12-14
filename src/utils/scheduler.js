const { autoCloseSessions } = require("../services/session.service");
const nonceStore = require("../stores/nonce.store");

setInterval(() => {
  const now = Date.now();

  for (const [n, v] of nonceStore.entries()) {
    if (v.expiresAt <= now) nonceStore.delete(n);
  }

  autoCloseSessions();
}, 2000);
