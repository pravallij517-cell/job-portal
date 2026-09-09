import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['job_seeker', 'recruiter', 'admin'],
      default: 'job_seeker',
    },
    profile: {
      phone: String,
      location: String,
      professionalSummary: String,
      photo: String,
      linkedin: String,
      github: String,
      companyName: String,
      companyLogo: String,
      industry: String,
      companyDescription: String,
      website: String,
      companySize: String,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    skills: [String],
    education: [String],
    experience: [String],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ name: 'text' });

const User = mongoose.model('User', userSchema);
export default User;
