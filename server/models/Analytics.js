import mongoose from 'mongoose';

// Platform Usage Model
const platformUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'], required: true },
  browser: { type: String },
  os: { type: String },
  location: { type: String }, // country/city
  duration: { type: Number }, // session duration in seconds
  pagesVisited: { type: Number, default: 1 },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
}, { timestamps: true });

// Feature Usage Model
const featureUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  featureName: { type: String, required: true },
  category: { type: String, enum: ['ai_tool', 'content', 'export', 'collaboration'], required: true },
  usageCount: { type: Number, default: 1 },
  totalTime: { type: Number, default: 0 }, // total time spent in seconds
  lastUsed: { type: Date, default: Date.now },
}, { timestamps: true });

// Feedback Model
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['rating', 'suggestion', 'bug_report', 'feature_request'], required: true },
  rating: { type: Number, min: 1, max: 5 }, // for rating type
  subject: { type: String, required: true },
  message: { type: String, required: true },
  feature: { type: String }, // which feature the feedback is about
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  adminResponse: { type: String },
  responseDate: { type: Date },
}, { timestamps: true });

export const PlatformUsage = mongoose.model('PlatformUsage', platformUsageSchema);
export const FeatureUsage = mongoose.model('FeatureUsage', featureUsageSchema);
export const Feedback = mongoose.model('Feedback', feedbackSchema);