import express from "express";
import { generateQR } from "../services/qr.service.js";
import { getSession } from "../services/session.service.js";
import { QR_TTL_SECONDS } from "../config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { workshop, day, session } = req.query;

  if (!workshop || !day || !session) {
    return res.status(400).send("Missing workshop/day/session");
  }

  const sessionId = `${workshop}-D${day}-S${session}`;
  const sessionInfo = getSession(sessionId);

  if (!sessionInfo || sessionInfo.status !== "ACTIVE") {
    return res.status(400).send("Session not active");
  }

  const qr = await generateQR(sessionId);

  res.send(`
    <html>
      <body style="text-align:center;font-family:sans-serif">
        <h2>Scan to Mark Attendance</h2>
        <h3>${sessionId}</h3>
        <img src="${qr}" />
        <p>QR refreshes automatically</p>
        <script>
          setTimeout(() => location.reload(), ${QR_TTL_SECONDS}*1000);
        </script>
      </body>
    </html>
  `);
});

export default router;
