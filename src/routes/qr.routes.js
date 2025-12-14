const express = require("express");
const { getSession } = require("../services/session.service");
const { generateQR } = require("../services/qr.service");
const { QR_TTL_SECONDS } = require("../config");

const router = express.Router();

router.get("/", async (req, res) => {
  const { workshop, day, session } = req.query;

  if (!workshop || !day || !session) {
    return res.status(400).send("Missing query params");
  }

  const sessionId = `${workshop}-D${day}-S${session}`;
  const s = getSession(sessionId);

  if (!s || s.status !== "ACTIVE") {
    return res.status(400).send("Session not active");
  }

  const qrImage = await generateQR(sessionId);

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html>
      <body style="text-align:center;font-family:sans-serif">
        <h2>${sessionId}</h2>
        <img src="${qrImage}" />
        <p>QR auto-refreshes</p>
        <script>
          setTimeout(() => location.reload(), 10000);
        </script>
      </body>
    </html>
  `);
});


module.exports = router;
