import Attendance from "../models/attendance.model.js";

export async function markAttendance(sessionId, deviceId) {
  try {
    await Attendance.create({ sessionId, deviceId });
  } catch (error) {
    // Catch unique index violation
    if (error.code === 11000) {
    throw new Error("Device already scanned for this session");
    }
    throw error; // Re-throw other errors
  }
}

export async function summary() {
  const results = await Attendance.aggregate([
    { $group: { _id: '$sessionId', count: { $sum: 1 } } }
  ]);
  return results.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
}

export async function getFullLog() {
  const records = await Attendance.find({}).sort({ scannedAt: 1 }).lean();
  // Group by sessionId for the format expected by the frontend
  return records.reduce((acc, record) => {
    if (!acc[record.sessionId]) {
      acc[record.sessionId] = [];
    }
    acc[record.sessionId].push({ deviceId: record.deviceId, scannedAt: record.scannedAt });
    return acc;
  }, {});
}
