import QRCode from "qrcode";
import crypto from "crypto";
import Nonce from "../models/nonce.model.js";
import { ORIGIN, QR_TTL_SECONDS } from "../config.js";
import { logger } from "../utils/logger.js";

export async function generateQR(sessionId) {
  const nonce = crypto.randomUUID();
  const issuedAt = Date.now();

  await Nonce.create({
    _id: nonce,
    sessionId,
    expiresAt: issuedAt + QR_TTL_SECONDS * 1000
  });

  logger.info("QR issued", { sessionId, nonce });

  const url = `${ORIGIN}/checkin?nonce=${nonce}`;
  return QRCode.toDataURL(url);
}
