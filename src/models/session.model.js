import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // sessionId
  status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

sessionSchema.index({ status: 1, endTime: 1 });

export default mongoose.model('Session', sessionSchema);