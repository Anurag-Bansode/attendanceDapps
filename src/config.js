import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT || 3000;
export const SESSION_SECRET = process.env.SESSION_SECRET || 'a-super-secret-key-that-should-be-in-env-file';
export const RP_NAME = process.env.RP_NAME || "Chipper";
export const RP_ID = process.env.RP_ID||"http://localhost/";
export const ORIGIN = `${RP_ID}`;
export const QR_TTL_SECONDS = process.env.QR_TTL_SECONDS || 30
export const ENABLE_LOGS= process.env.ENABLE_LOGS || "false"
export const NODE_ENV= process.env.ENV || "development"
export const LOG_DIR = process.env.LOG_DIR||"D:/Attendance/attendance/logs"

console.log(process.env)