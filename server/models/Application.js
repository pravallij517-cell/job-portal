import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: String,
      default: '',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'],
      default: 'Applied',
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    matchExplanation: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ recruiterId: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
