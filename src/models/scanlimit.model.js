import mongoose from 'mongoose';

const scanLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // "sessionId:deviceId"
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, index: { expires: '1d' } }, // Expire after 1 day
});

export default mongoose.model('ScanLimit', scanLimitSchema);