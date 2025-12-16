import mongoose from 'mongoose';

const identitySchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Using deviceId as the primary key
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

// Index email for faster lookups if needed in the future
identitySchema.index({ email: 1 });

export default mongoose.model('Identity', identitySchema);