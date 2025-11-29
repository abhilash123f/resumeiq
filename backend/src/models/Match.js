import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  breakdown: {
    skills: { type: Number, min: 0, max: 100 },
    experience: { type: Number, min: 0, max: 100 },
    keywords: { type: Number, min: 0, max: 100 },
  },
  missingSkills: [String],
  strengths: [String],
  weaknesses: [String],
  explanation: String,
  tailoredBullets: [String],
  originalBullets: [String],
  atsWarnings: [String],
  atsRecommendations: [String],
  passesATS: {
    type: Boolean,
    default: true,
  },
  topChunks: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
matchSchema.index({ userId: 1, createdAt: -1 });
matchSchema.index({ resumeId: 1 });
matchSchema.index({ score: -1 });
matchSchema.index({ userId: 1, isDeleted: 1 }); // For filtering deleted items
matchSchema.index({ deletedAt: 1 }); // For TTL cleanup

const Match = mongoose.model('Match', matchSchema);

export default Match;
