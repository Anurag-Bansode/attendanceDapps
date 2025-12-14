const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const nonceStore = require("../stores/nonce.store");
const { QR_TTL_SECONDS } = require("../config");
const { BASE_URL } = require("../config");




async function generateQR(sessionId) {
  const nonce = uuidv4();
  const issuedAt = Date.now();

  nonceStore.set(nonce, {
    sessionId,
    expiresAt: issuedAt + QR_TTL_SECONDS * 1000
  });

  const payload = JSON.stringify({
    session_id: sessionId,
    nonce,
    issued_at: issuedAt
  });

  const checkinUrl = `${BASE_URL}/checkin?nonce=${nonce}`;
  return QRCode.toDataURL(checkinUrl);

}

module.exports = { generateQR };
