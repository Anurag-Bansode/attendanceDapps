import express from "express";
import { generateQR } from "../services/qr.service.js";
import { getSession } from "../services/session.service.js";
import { QR_TTL_SECONDS } from "../config.js";
import { logger } from "../utils/logger.js"; 
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

router.get("/api", asyncHandler(async (req, res, next) => {
  const { workshop, day, session } = req.query;

  logger.info("Received QR generation request", { workshop, day, session }); 

  if (!workshop || !day || !session) {
    return next(new AppError("Missing workshop/day/session", 400));
  }

  const sessionId = `${workshop}-D${day}-S${session}`;
  const sessionInfo = await getSession(sessionId);

  if (!sessionInfo || sessionInfo.status !== "ACTIVE") {
    return next(new AppError("Session not active", 400));
  }

  const qr = await generateQR(sessionId);
  logger.info("QR generated successfully", { sessionId }); 
  
  res.json({
    qr,
    sessionId,
    ttl: QR_TTL_SECONDS
  });
}));

router.get("/", (req, res) => {
  res.sendFile("qr.html", { root: "src/public" });
});

export default router;
