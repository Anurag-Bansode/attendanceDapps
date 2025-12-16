import ScanLimit from "../models/scanlimit.model.js";

const MAX_SCANS_PER_SESSION = 2;

export async function checkAndIncrement(sessionId, deviceId) {
  const key = `${sessionId}:${deviceId}`;
  
  const result = await ScanLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date() } },
    { new: true, upsert: true } // upsert: create if it doesn't exist
  ).lean();

  const count = result.count;

  if (count > MAX_SCANS_PER_SESSION) {
    return false;
  }

  return true;
}
