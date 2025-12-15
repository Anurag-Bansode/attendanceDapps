import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT || 3000;
export const SESSION_SECRET = process.env.SESSION_SECRET || 'a-super-secret-key-that-should-be-in-env-file';
export const RP_NAME = process.env.RP_NAME || "Chipper";
export const RP_ID = process.env.RP_ID||"http://localhost/";
export const ORIGIN = `http://${RP_ID}:${PORT}`;
export const QR_TTL_SECONDS = process.env.QR_TTL_SECONDS || 60 * 100
export const ENABLE_LOGS= process.env.ENABLE_LOGS
export const ENV= process.env.ENV
export const LOG_DIR = "D:/Attendance/attendance/logs"