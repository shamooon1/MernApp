import mongoose from 'mongoose';

const searchQuerySchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toolName: { type: String, trim: true },
    source: { type: String, enum: ['search_bar', 'tool_use', 'suggestion'], default: 'search_bar' },
  },
  { timestamps: true }
);

// Index for faster queries
searchQuerySchema.index({ query: 1, createdAt: -1 });
searchQuerySchema.index({ createdAt: -1 });

export default mongoose.model('SearchQuery', searchQuerySchema);