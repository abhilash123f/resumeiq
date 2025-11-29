import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  tokens: {
    type: Number,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  text: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  chunks: [chunkSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
