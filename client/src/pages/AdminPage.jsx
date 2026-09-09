import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  X,
  ToggleLeft,
  ToggleRight,
  Eye,
  Clock,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import api from '../services/api.js';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('add-job'); // 'add-job' | 'manage-jobs' | 'users' | 'overview'
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Job Search & Filters inside Admin
  const [jobSearch, setJobSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // User Search
  const [userSearch, setUserSearch] = useState('');

  // Initial Add Job Form State
  const initialForm = {
    title: '',
    company: '',
    location: '',
    employmentType: 'Full Time',
    jobType: 'Full Time',
    experience: '0–2 years',
    salary: 'Competitive / As per industry standards',
    education: 'Bachelor’s degree or equivalent practical experience',
    officialApplyUrl: '',
    source: 'Platform Administrator Direct',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    skills: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    benefits: '',
    isActive: true,
  };

  const [form, setForm] = useState(initialForm);

  // Edit Job Modal State
  const [editingJob, setEditingJob] = useState(null);

  // Load all admin data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, jobsRes, usersRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/jobs'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats || {});
      setJobs(jobsRes.data.jobs || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setMessage({ type: 'error', text: 'Failed to load administrator data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle Job Form Submission (Add Job)
  const handleAddJobSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/admin/jobs', form);
      setMessage({
        type: 'success',
        text: `Job "${response.data.job.title}" at "${response.data.job.company}" published successfully and is now dynamically live!`,
      });
      // Prepend newly created job to jobs list
      setJobs((prev) => [response.data.job, ...prev]);
      setForm(initialForm);
      // Refresh stats
      api.get('/admin/statistics').then((res) => setStats(res.data.stats || {}));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to publish job. Please check all required fields.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Job Modal Save
  const handleUpdateJobSubmit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    setActionLoading(true);

    try {
      const response = await api.post ? await api.put(`/admin/jobs/${editingJob._id}`, editingJob) : null;
      setMessage({
        type: 'success',
        text: `Job "${response.data.job.title}" updated successfully!`,
      });
      setJobs((prev) =>
        prev.map((j) => (j._id === editingJob._id ? response.data.job : j))
      );
      setEditingJob(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update job');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Job Active Status
  const handleToggleStatus = async (jobId) => {
    try {
      const response = await api.patch(`/admin/jobs/${jobId}/status`);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? response.data.job : j))
      );
      // Refresh stats count
      api.get('/admin/statistics').then((res) => setStats(res.data.stats || {}));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle job status');
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setMessage({ type: 'success', text: `Job "${title}" was removed successfully.` });
      // Refresh stats
      api.get('/admin/statistics').then((res) => setStats(res.data.stats || {}));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete job');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}"?`)) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setMessage({ type: 'success', text: `User "${name}" has been removed.` });
      api.get('/admin/statistics').then((res) => setStats(res.data.stats || {}));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Filtered jobs list
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.company?.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.location?.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.skills?.some((s) => s.toLowerCase().includes(jobSearch.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? job.isActive !== false
        : job.isActive === false;

    return matchesSearch && matchesStatus;
  });

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    return (
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-soft">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300 border border-brand-400/30">
              <ShieldCheck size={14} /> Administrator Authority Panel
            </div>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Platform Job & Content Management</h1>
            <p className="mt-2 max-w-2xl text-slate-300 text-sm leading-relaxed">
              Create, publish, edit, and manage all dynamic job opportunities with complete details. All listings are immediately propagated in real-time across the search directory, details pages, and homepage feeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('add-job');
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-soft hover:bg-brand-500 transition"
            >
              <PlusCircle size={16} /> Post New Job
            </button>
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Data
            </button>
            <Link
              to="/jobs"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <Eye size={15} /> View Live Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Global Status / Alert Banner */}
      {message.text && (
        <div
          className={`mb-6 flex items-center justify-between rounded-2xl p-4 text-sm font-medium ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="p-1 hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Key Metric Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Jobs</span>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalJobs || jobs.length || 0}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="font-semibold text-emerald-600">
              {stats.activeJobs ?? jobs.filter((j) => j.isActive !== false).length} Active
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-500">
              {stats.inactiveJobs ?? jobs.filter((j) => j.isActive === false).length} Inactive
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Applications</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalApplications || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">Submitted candidates across portal</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Job Seekers</span>
            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600 dark:bg-cyan-950">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats.jobSeekers || users.filter((u) => u.role === 'job_seeker').length || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">Registered candidates</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalUsers || users.length || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.recruiters || users.filter((u) => u.role === 'recruiter').length || 0} Recruiters / Admins
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('add-job')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
            activeTab === 'add-job'
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <PlusCircle size={16} /> Add New Job (All Details)
        </button>

        <button
          onClick={() => setActiveTab('manage-jobs')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
            activeTab === 'manage-jobs'
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase size={16} /> Manage Jobs
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
            activeTab === 'users'
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Users size={16} /> Manage Users
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {users.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ADD NEW JOB FORM */}
      {activeTab === 'add-job' && (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Full Authority Form
              </div>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Add Job With Complete Specifications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Fill in all details below. The job will be instantly published to the portal and displayed to all visitors.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm(initialForm)}
              className="self-start rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Clear Form
            </button>
          </div>

          <form onSubmit={handleAddJobSubmit} className="mt-8 space-y-8">
            {/* Section 1: Core Information */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  1
                </span>
                Primary Job Attributes
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer, Cloud Architect, AI Specialist"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Hiring Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="e.g. Google, Microsoft, NextGen Tech"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Location / Work Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Bengaluru, India / Remote / Hybrid"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Employment Type
                  </label>
                  <select
                    value={form.employmentType}
                    onChange={(e) =>
                      setForm({ ...form, employmentType: e.target.value, jobType: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Experience Level Required
                  </label>
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. 0–2 years, 3–5 years, Freshers Welcome"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Compensation, Education & Application Info */}
            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  2
                </span>
                Compensation, Qualifications & URLs
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Salary / Compensation Range
                  </label>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="e.g. ₹12,00,000 - ₹20,00,000 PA / Competitive"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Education Requirements
                  </label>
                  <input
                    type="text"
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    placeholder="e.g. B.Tech/BE in CS/IT, MCA, or Equivalent Experience"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Official Application URL / Portal Link
                  </label>
                  <input
                    type="url"
                    value={form.officialApplyUrl}
                    onChange={(e) => setForm({ ...form, officialApplyUrl: e.target.value })}
                    placeholder="e.g. https://careers.company.com/jobs/apply/10294"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    If provided, applicants clicking &quot;Apply&quot; will be routed to this official careers portal.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Job Source
                  </label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    placeholder="e.g. Admin Direct, Company Careers"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Skills & Description */}
            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  3
                </span>
                Skills & Comprehensive Description
              </h3>

              <div className="mt-4 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Required Skills (Comma separated) *
                  </label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, TypeScript, MongoDB, Docker, AWS"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Comprehensive Job Description & Overview *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide a detailed summary of the role, day-to-day context, team dynamics, and objectives..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Detailed Lists (Responsibilities, Qualifications, Benefits) */}
            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  4
                </span>
                Detailed Sections (Newline or bullet separated)
              </h3>

              <div className="mt-4 grid gap-5 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Key Responsibilities
                  </label>
                  <textarea
                    rows={5}
                    value={form.responsibilities}
                    onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                    placeholder="• Design scalable web microservices&#10;• Collaborate with UX and Product managers&#10;• Maintain high code coverage and CI/CD"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Qualifications & Criteria
                  </label>
                  <textarea
                    rows={5}
                    value={form.qualifications}
                    onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                    placeholder="• 2+ years working with modern JavaScript&#10;• Experience with RESTful APIs & MongoDB&#10;• Good communication and problem-solving"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Benefits & Perks
                  </label>
                  <textarea
                    rows={5}
                    value={form.benefits}
                    onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                    placeholder="• Comprehensive Health & Dental Insurance&#10;• Flexible Remote Working Hours&#10;• Learning and Conference Stipend"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Visibility checkbox & Submit Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Publish as Active (Visible immediately to all users)
                </span>
              </label>

              <button
                type="submit"
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-soft hover:bg-brand-500 transition disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Job Instantly</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MANAGE JOBS LIST */}
      {activeTab === 'manage-jobs' && (
        <div className="space-y-6">
          {/* Filters & Search Row */}
          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Search jobs by title, company, location, skill..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Active ({jobs.filter((j) => j.isActive !== false).length})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Inactive ({jobs.filter((j) => j.isActive === false).length})
              </button>
            </div>
          </div>

          {/* Jobs Listing */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Job Listings ({filteredJobs.length})
              </h3>
              <button
                onClick={() => setActiveTab('add-job')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
              >
                <PlusCircle size={14} /> Add Another Job
              </button>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Briefcase size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="font-semibold">No jobs match your search or filter</p>
                <p className="text-xs text-slate-400 mt-1">Try changing your search term or add a new job</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="flex flex-col justify-between gap-4 py-5 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30 sm:flex-row sm:items-center rounded-2xl px-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {job.title}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            job.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {job.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {job.jobType || job.employmentType || 'Full Time'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Building2 size={13} /> {job.company}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} /> {job.location}
                        </span>
                        <span>💰 {job.salary || 'Competitive'}</span>
                        <span>⏱ Exp: {job.experience || '0–2 yrs'}</span>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skills.slice(0, 5).map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Toggle status button */}
                      <button
                        onClick={() => handleToggleStatus(job._id)}
                        title={`Click to mark as ${job.isActive !== false ? 'Inactive' : 'Active'}`}
                        className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          job.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {job.isActive !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {job.isActive !== false ? 'Active' : 'Inactive'}
                      </button>

                      {/* View details */}
                      <Link
                        to={`/jobs/${job._id}`}
                        target="_blank"
                        title="View Public Details"
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <Eye size={13} /> View
                      </Link>

                      {/* Edit button */}
                      <button
                        onClick={() =>
                          setEditingJob({
                            ...job,
                            skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
                            responsibilities: Array.isArray(job.responsibilities)
                              ? job.responsibilities.join('\n')
                              : job.responsibilities || '',
                            qualifications: Array.isArray(job.qualifications)
                              ? job.qualifications.join('\n')
                              : job.qualifications || '',
                            benefits: Array.isArray(job.benefits)
                              ? job.benefits.join('\n')
                              : job.benefits || '',
                            deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
                          })
                        }
                        title="Edit Job"
                        className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                      >
                        <Pencil size={13} /> Edit
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteJob(job._id, job.title)}
                        title="Delete Job"
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950 dark:text-red-400"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Registered Users</h3>
              <p className="mt-1 text-sm text-slate-500">Overview of all candidate and recruiter accounts</p>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between py-4 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {user.name}
                    {user.role === 'admin' && (
                      <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : user.role === 'recruiter'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {user.role}
                  </span>

                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 transition"
                      title="Remove User"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT JOB MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Edit Job: {editingJob.title}
              </h3>
              <button
                onClick={() => setEditingJob(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateJobSubmit} className="mt-6 space-y-5 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Company</label>
                  <input
                    type="text"
                    required
                    value={editingJob.company}
                    onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Location</label>
                  <input
                    type="text"
                    required
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Employment Type</label>
                  <select
                    value={editingJob.employmentType || editingJob.jobType}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        employmentType: e.target.value,
                        jobType: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Salary</label>
                  <input
                    type="text"
                    value={editingJob.salary}
                    onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Experience</label>
                  <input
                    type="text"
                    value={editingJob.experience}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Official Apply URL</label>
                  <input
                    type="url"
                    value={editingJob.officialApplyUrl || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, officialApplyUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={editingJob.skills}
                    onChange={(e) => setEditingJob({ ...editingJob, skills: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Description</label>
                  <textarea
                    rows={4}
                    value={editingJob.description}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Responsibilities</label>
                  <textarea
                    rows={3}
                    value={editingJob.responsibilities}
                    onChange={(e) => setEditingJob({ ...editingJob, responsibilities: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Qualifications</label>
                  <textarea
                    rows={3}
                    value={editingJob.qualifications}
                    onChange={(e) => setEditingJob({ ...editingJob, qualifications: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={editingJob.isActive !== false}
                    onChange={(e) => setEditingJob({ ...editingJob, isActive: e.target.checked })}
                    className="rounded text-brand-600"
                  />
                  <span>Active & Listed</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-500 shadow-soft"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
