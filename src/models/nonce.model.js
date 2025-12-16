import mongoose from 'mongoose';

const nonceSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // The nonce value
  sessionId: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '1s' } }, // TTL index
});

export default mongoose.model('Nonce', nonceSchema);