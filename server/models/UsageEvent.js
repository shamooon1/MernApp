import mongoose from 'mongoose';

const usageEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toolName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('UsageEvent', usageEventSchema);