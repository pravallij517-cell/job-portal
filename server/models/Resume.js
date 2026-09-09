import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    // filePath kept for backward-compat but not used in serverless mode
    filePath: {
      type: String,
      default: '',
    },
    // File stored as binary in MongoDB (works on serverless — no disk needed)
    fileData: {
      type: Buffer,
      default: null,
    },
    mimeType: {
      type: String,
      default: '',
    },
    extractedSkills: [String],
    education: [String],
    experience: [String],
    jobTitles: [String],
    keywords: [String],
    aiAnalysis: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ userId: 1 });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;

