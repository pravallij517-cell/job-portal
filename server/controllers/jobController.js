import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import User from '../models/User.js';
import { matchJobWithGroq } from '../services/groqService.js';
import { syncOfficialJobs } from '../services/jobSyncService.js';

const parseList = (val) => {
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  if (typeof val === 'string') {
    return val
      .split(/[\n,]+/)
      .map((s) => s.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);
  }
  return [];
};

export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      skills,
      experience,
      education,
      location,
      employmentType,
      jobType,
      salary,
      source,
      officialApplyUrl,
      responsibilities,
      qualifications,
      benefits,
      deadline,
    } = req.body;

    if (!title || !company || !description || !location) {
      return res.status(400).json({ message: 'Please provide required job information (Title, Company, Location, Description)' });
    }

    const finalDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const finalJobType = jobType || employmentType || 'Full Time';
    const finalEmploymentType = employmentType || jobType || 'Full Time';
    const finalSource = source || (req.user.role === 'admin' ? 'Platform Administrator' : 'Direct Employer Posting');

    const job = await Job.create({
      recruiterId: req.user._id,
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      skills: parseList(skills),
      experience: experience?.trim() || '0–2 years',
      education: education?.trim() || 'Bachelor’s degree or relevant experience',
      location: location.trim(),
      jobType: finalJobType,
      employmentType: finalEmploymentType,
      salary: salary?.trim() || 'Competitive / As per industry standards',
      source: finalSource,
      officialApplyUrl: officialApplyUrl ? officialApplyUrl.trim() : '',
      responsibilities: parseList(responsibilities),
      qualifications: parseList(qualifications),
      benefits: parseList(benefits),
      deadline: finalDeadline,
      isActive: true,
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Job creation failed' });
  }
};

const escapeRegex = (string = '') => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getJobs = async (req, res) => {
  try {
    const { search, title, company, skills, location, jobType, employmentType, experience, source, sort } = req.query;

    const query = { isActive: { $ne: false } };

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { skills: { $in: [searchRegex] } },
        { description: searchRegex },
      ];
    }

    if (title && title.trim()) {
      query.title = { $regex: new RegExp(escapeRegex(title.trim()), 'i') };
    }

    if (company && company.trim()) {
      query.company = { $regex: new RegExp(escapeRegex(company.trim()), 'i') };
    }

    if (skills && skills.trim()) {
      const skillTerms = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillTerms.length > 0) {
        query.skills = { $in: skillTerms.map((term) => new RegExp(escapeRegex(term), 'i')) };
      }
    }

    if (location && location.trim()) {
      query.location = { $regex: new RegExp(escapeRegex(location.trim()), 'i') };
    }

    const typeFilter = jobType || employmentType;
    if (typeFilter && typeFilter.trim() && typeFilter.toLowerCase() !== 'all') {
      const typeRegex = new RegExp(`^${escapeRegex(typeFilter.trim())}$`, 'i');
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          {
            $or: [{ jobType: typeRegex }, { employmentType: typeRegex }],
          },
        ];
        delete query.$or;
      } else {
        query.$or = [{ jobType: typeRegex }, { employmentType: typeRegex }];
      }
    }

    if (experience && experience.trim() && experience.toLowerCase() !== 'all') {
      query.experience = { $regex: new RegExp(escapeRegex(experience.trim()), 'i') };
    }

    if (source && source.trim() && source.toLowerCase() !== 'all') {
      query.source = { $regex: new RegExp(escapeRegex(source.trim()), 'i') };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'salary-low-high') sortObj = { salary: 1 };
    if (sort === 'salary-high-low') sortObj = { salary: -1 };
    if (sort === 'company-az') sortObj = { company: 1 };

    const jobs = await Job.find(query).sort(sortObj).lean();

    res.json({ jobs, count: jobs.length });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch jobs' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch job' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const isOwner = job.recruiterId && job.recruiterId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    const updateData = { ...req.body };
    if (updateData.skills) updateData.skills = parseList(updateData.skills);
    if (updateData.responsibilities) updateData.responsibilities = parseList(updateData.responsibilities);
    if (updateData.qualifications) updateData.qualifications = parseList(updateData.qualifications);
    if (updateData.benefits) updateData.benefits = parseList(updateData.benefits);
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);

    Object.assign(job, updateData);
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Job update failed' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const isOwner = job.recruiterId && job.recruiterId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Job deletion failed' });
  }
};

export const getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const jobs = await Job.find({ isActive: true }).lean();
    const recommendations = await Promise.all(
      jobs.map(async (job) => {
        const result = await matchJobWithGroq(
          {
            skills: user.skills || [],
            experience: user.experience || [],
            education: user.education || [],
          },
          {
            title: job.title,
            requiredSkills: job.skills || [],
            experience: job.experience,
            education: job.education,
          }
        );

        return {
          ...job,
          matchScore: result.matchScore || 0,
          aiRecommendation: result.explanation || '',
        };
      })
    );

    recommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    res.json({ jobs: recommendations.slice(0, 6) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get recommendations' });
  }
};

export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const existing = await SavedJob.findOne({ userId: req.user._id, jobId });

    if (existing) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    const saved = await SavedJob.create({ userId: req.user._id, jobId });
    res.status(201).json({ message: 'Job saved successfully', saved });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to save job' });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.user._id }).populate('jobId');
    res.json({ jobs: savedJobs.map((saved) => saved.jobId) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch saved jobs' });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch recruiter jobs' });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const isJobSeeker = req.user?.role === 'job_seeker';

    if (isJobSeeker) {
      const [totalApplications, shortlisted, rejected, pending, savedCount, totalActiveJobs] = await Promise.all([
        Application.countDocuments({ candidateId: req.user._id }),
        Application.countDocuments({ candidateId: req.user._id, status: 'Shortlisted' }),
        Application.countDocuments({ candidateId: req.user._id, status: 'Rejected' }),
        Application.countDocuments({ candidateId: req.user._id, status: 'Applied' }),
        SavedJob.countDocuments({ userId: req.user._id }),
        Job.countDocuments({ isActive: { $ne: false } }),
      ]);

      return res.json({
        stats: {
          role: 'job_seeker',
          totalApplications,
          shortlisted,
          rejected,
          pending,
          savedJobs: savedCount,
          totalJobs: totalActiveJobs,
          activeJobs: totalActiveJobs,
        },
      });
    }

    // Recruiter / Admin stats
    const [jobs, applicants, candidateCount, shortlisted] = await Promise.all([
      Job.countDocuments({ recruiterId: req.user._id }),
      Application.countDocuments({ recruiterId: req.user._id }),
      User.countDocuments({ role: 'job_seeker' }),
      Application.countDocuments({ recruiterId: req.user._id, status: 'Shortlisted' }),
    ]);

    res.json({
      stats: {
        role: req.user.role,
        totalJobs: jobs,
        activeJobs: jobs,
        totalApplicants: applicants,
        shortlisted,
        rejected: await Application.countDocuments({ recruiterId: req.user._id, status: 'Rejected' }),
        pending: await Application.countDocuments({ recruiterId: req.user._id, status: 'Applied' }),
        candidates: candidateCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Dashboard fetch failed' });
  }
};

export const syncJobsHandler = async (req, res) => {
  try {
    const result = await syncOfficialJobs();
    res.json({ message: 'Job synchronization completed', ...result });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Job synchronization failed' });
  }
};
