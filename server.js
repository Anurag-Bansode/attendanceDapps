const express = require("express");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { QR_TTL_SECONDS, PORT } = require("./config");

const app = express();

const nonceStore = new Map();


setInterval(() => {
  const now = Date.now();
  for (const [nonce, data] of nonceStore.entries()) {
    if (data.expiresAt <= now) {
      nonceStore.delete(nonce);
    }
  }
}, 1000);


app.get("/qr", async (req, res) => {
  const sessionId = req.query.session_id || "SESSION-1";

  const nonce = uuidv4();
  const issuedAt = Date.now();

  nonceStore.set(nonce, {
    sessionId,
    expiresAt: issuedAt + QR_TTL_SECONDS * 1000
  });

  const qrPayload = JSON.stringify({
    session_id: sessionId,
    nonce,
    issued_at: issuedAt,
    ttl: QR_TTL_SECONDS
  });

  try {
    const qrImage = await QRCode.toDataURL(qrPayload);
    res.send(`
      <html>
        <body style="text-align:center;font-family:sans-serif">
          <h2>Live QR Code</h2>
          <img src="${qrImage}" />
          <p>Expires in ${QR_TTL_SECONDS} seconds</p>
          <script>
            setTimeout(() => location.reload(), ${QR_TTL_SECONDS * 1000});
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).json({ error: "QR generation failed" });
  }
});


app.post("/validate", express.json(), (req, res) => {
  const { nonce } = req.body;

  const record = nonceStore.get(nonce);
  if (!record) {
    return res.status(400).json({ valid: false, reason: "Invalid or expired QR" });
  }

  nonceStore.delete(nonce); // one-time use
  res.json({ valid: true, session_id: record.sessionId });
});

app.listen(PORT, () => {
  console.log(`QR server running on http://localhost:${PORT}`);
});
