import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

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

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch jobs' });
  }
};

export const createAdminJob = async (req, res) => {
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
      isActive,
    } = req.body;

    if (!title || !company || !description || !location) {
      return res.status(400).json({ message: 'Title, Company, Location, and Description are required' });
    }

    const job = await Job.create({
      recruiterId: req.user._id,
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      skills: parseList(skills),
      experience: experience?.trim() || '0–2 years',
      education: education?.trim() || 'Bachelor’s degree or relevant experience',
      location: location.trim(),
      jobType: jobType || employmentType || 'Full Time',
      employmentType: employmentType || jobType || 'Full Time',
      salary: salary?.trim() || 'Competitive / As per industry standards',
      source: source?.trim() || 'Platform Administrator',
      officialApplyUrl: officialApplyUrl ? officialApplyUrl.trim() : '',
      responsibilities: parseList(responsibilities),
      qualifications: parseList(qualifications),
      benefits: parseList(benefits),
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ message: 'Job created successfully by Admin', job });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create job' });
  }
};

export const updateAdminJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updateData = { ...req.body };
    if (updateData.skills !== undefined) updateData.skills = parseList(updateData.skills);
    if (updateData.responsibilities !== undefined) updateData.responsibilities = parseList(updateData.responsibilities);
    if (updateData.qualifications !== undefined) updateData.qualifications = parseList(updateData.qualifications);
    if (updateData.benefits !== undefined) updateData.benefits = parseList(updateData.benefits);
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);

    Object.assign(job, updateData);
    await job.save();

    res.json({ message: 'Job updated successfully by Admin', job });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update job' });
  }
};

export const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.json({
      message: `Job status changed to ${job.isActive ? 'Active' : 'Inactive'}`,
      job,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to toggle job status' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete primary admin account' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'User delete failed' });
  }
};

export const deleteJobByAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed successfully by Admin' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Job delete failed' });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const [totalUsers, jobSeekers, recruiters, totalJobs, totalApplications, activeJobs, inactiveJobs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'job_seeker' }),
      User.countDocuments({ role: 'recruiter' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Job.countDocuments({ isActive: false }),
    ]);

    res.json({
      stats: {
        totalUsers,
        jobSeekers,
        recruiters,
        totalJobs,
        totalApplications,
        activeJobs,
        inactiveJobs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch statistics' });
  }
};
