import mongoose from 'mongoose';

// Capped collections are high-performance collections for storing log-like data.
const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: String,
  message: String,
  meta: mongoose.Schema.Types.Mixed,
}, {
  capped: { size: 10485760, max: 10000 }, // 10MB, 10,000 documents
  timestamps: { createdAt: 'timestamp', updatedAt: false },
});

export default mongoose.model('Log', logSchema);