
import 'dotenv/config.js'
export const PORT = process.env.PORT || 3000;
export const RP_NAME = process.env.RP_NAME || "Chipper";
export const RP_ID = process.env.RP_ID||"https://chipper-nougat-8e8da4.netlify.app/";
export const ORIGIN = process.env.ORIGIN || `https://${RP_ID}:${PORT}`;
export const BASE_URL = process.env.ORIGIN||"https://chipper-nougat-8e8da4.netlify.app";
export const QR_TTL_SECONDS = process.env.QR_TTL_SECONDS || 60 * 100;
export const ENABLE_LOGS= process.env.ENABLE_LOGS
export const LOG_DIR = "D:/Attendance/attendance/logs"

