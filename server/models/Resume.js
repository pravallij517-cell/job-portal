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
    filePath: {
      type: String,
      required: true,
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
