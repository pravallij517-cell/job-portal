import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { matchJobWithGroq, rankCandidatesWithGroq } from '../services/groqService.js';
import User from '../models/User.js';

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resume } = req.body;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existing = await Application.findOne({ jobId, candidateId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const candidate = await User.findById(req.user._id);
    const matchResult = await matchJobWithGroq(
      {
        skills: candidate.skills || [],
        experience: candidate.experience || [],
        education: candidate.education || [],
      },
      {
        title: job.title,
        requiredSkills: job.skills || [],
        experience: job.experience,
        education: job.education,
      }
    );

    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      recruiterId: job.recruiterId,
      coverLetter: coverLetter || '',
      resume: resume || '',
      status: 'Applied',
      matchScore: matchResult.matchScore || 0,
      matchExplanation: matchResult.explanation || '',
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Application failed' });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id }).populate('jobId').sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch applications' });
  }
};

export const getApplicationsForJob = async (req, res) => {
  try {
    // Sort by matchScore descending so recruiters see best fits first
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('candidateId', 'name email profile skills education experience')
      .sort({ matchScore: -1, createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch job applicants' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    const allowedStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid application status' });
    }

    application.status = status;
    await application.save();

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Status update failed' });
  }
};

export const getRecruiterCandidates = async (req, res) => {
  try {
    const jobId = req.query.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get only actual applicants for this job
    const applications = await Application.find({ jobId })
      .populate('candidateId', '-password')
      .sort({ matchScore: -1 });

    // Build ranked list from the stored matchScore on each application
    const ranked = applications.map((app, index) => ({
      rank: index + 1,
      userId: app.candidateId?._id,
      name: app.candidateId?.name,
      email: app.candidateId?.email,
      skills: app.candidateId?.skills || [],
      education: app.candidateId?.education || [],
      experience: app.candidateId?.experience || [],
      matchScore: app.matchScore || 0,
      matchExplanation: app.matchExplanation || '',
      applicationId: app._id,
      status: app.status,
      appliedAt: app.createdAt,
    }));

    res.json({ ranked, total: ranked.length });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Candidate ranking failed' });
  }
};

export const rerankCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role === 'recruiter' && job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only rank candidates for your own jobs' });
    }

    const applications = await Application.find({ jobId }).populate('candidateId', '-password');
    if (applications.length === 0) {
      return res.json({ ranked: [], total: 0 });
    }

    const candidates = applications.map((application) => ({
      userId: application.candidateId?._id?.toString(),
      name: application.candidateId?.name,
      skills: application.candidateId?.skills || [],
      education: application.candidateId?.education || [],
      experience: application.candidateId?.experience || [],
      resumeScore: application.matchScore || 0,
    }));

    const rankings = await rankCandidatesWithGroq(candidates, {
      title: job.title,
      description: job.description,
      requiredSkills: job.skills || [],
      experience: job.experience,
      education: job.education,
    });

    const rankingByUserId = new Map(rankings.map((item) => [String(item.userId), item]));
    await Promise.all(
      applications.map((application) => {
        const result = rankingByUserId.get(application.candidateId?._id?.toString());
        if (!result) return Promise.resolve();
        application.matchScore = Math.max(0, Math.min(100, Number(result.matchScore) || 0));
        application.matchExplanation = typeof result.reason === 'string' ? result.reason : '';
        return application.save();
      })
    );

    return getRecruiterCandidates(req, res);
  } catch (error) {
    console.error('Candidate re-ranking error:', error);
    return res.status(500).json({ message: error.message || 'Candidate ranking failed' });
  }
};
