import mongoose from 'mongoose';

const builtResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      website: String,
    },
    summary: String,
    experience: [{
      company: String,
      role: String,
      location: String,
      startDate: String,
      endDate: String,
      bullets: [String],
    }],
    education: [{
      school: String,
      degree: String,
      field: String,
      location: String,
      graduationDate: String,
      gpa: String,
    }],
    skills: {
      technical: [String],
      soft: [String],
    },
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      link: String,
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: String,
    }],
  },
  template: {
    type: String,
    enum: ['professional', 'modern', 'minimal', 'creative'],
    default: 'professional',
  },
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

// Index for faster queries
builtResumeSchema.index({ userId: 1, updatedAt: -1 });

const BuiltResume = mongoose.model('BuiltResume', builtResumeSchema);

export default BuiltResume;
