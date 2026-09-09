import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: [{ type: String, trim: true }],
    experience: {
      type: String,
      default: '0–2 years',
    },
    education: {
      type: String,
      default: 'Bachelor’s degree or relevant experience',
    },
    location: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      default: 'Full Time',
    },
    employmentType: {
      type: String,
      default: 'Full Time',
    },
    salary: {
      type: String,
      default: 'Competitive / As per industry standards',
    },
    source: {
      type: String,
      default: 'Official Company Careers',
    },
    officialApplyUrl: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    responsibilities: [String],
    qualifications: [String],
    benefits: [String],
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: 'text', company: 'text', location: 'text', skills: 'text' });
jobSchema.index({ officialApplyUrl: 1 }, { unique: true, sparse: true });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ company: 1, title: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;

