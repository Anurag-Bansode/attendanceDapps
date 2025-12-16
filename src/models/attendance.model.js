import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  deviceId: { type: String, required: true, index: true },
  scannedAt: { type: Date, default: Date.now },
});

// Ensure a device can only attend a session once
attendanceRecordSchema.index({ sessionId: 1, deviceId: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceRecordSchema);