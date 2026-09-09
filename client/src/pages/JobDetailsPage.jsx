import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Bookmark,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  Gift,
  ListChecks,
  GraduationCap,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Pencil,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data.job);
      } catch (error) {
        console.error('Failed to load job details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleSaveJob = async () => {
    if (!user) {
      alert('Please log in to save jobs to your profile.');
      return;
    }
    try {
      await api.post(`/jobs/save/${job._id}`);
      setSaved(true);
      setSaveMessage('Saved to your profile');
    } catch (error) {
      setSaveMessage(error.response?.data?.message || 'Already saved');
    }
  };

  const handleDirectApply = async () => {
    if (!user) {
      alert('Please log in to submit your application.');
      return;
    }
    try {
      await api.post(`/applications/apply/${job._id}`);
      setApplied(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Application submitted successfully!');
      setApplied(true);
    }
  };

  const handleAdminToggleStatus = async () => {
    try {
      const response = await api.patch(`/admin/jobs/${job._id}/status`);
      setJob(response.data.job);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleAdminDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${job.title}"?`)) return;
    try {
      await api.delete(`/admin/jobs/${job._id}`);
      alert('Job deleted successfully');
      navigate('/jobs');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently posted';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently posted';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-slate-500">Loading verified job opportunity...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Job Not Found</h2>
        <p className="mt-2 text-slate-500">This opening may have closed or is no longer available.</p>
        <Link
          to="/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} /> Back to All Jobs
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Top Header & Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
        >
          <ArrowLeft size={16} /> Back to Job Search
        </Link>

        {isAdmin && (
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-300">
            Admin Authority Mode
          </div>
        )}
      </div>

      {/* Admin Action Bar (if Admin) */}
      {isAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-indigo-50 p-4 dark:border-brand-900/50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Status:</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                job.isActive !== false
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {job.isActive !== false ? 'Active (Live on Website)' : 'Inactive (Hidden from search)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdminToggleStatus}
              className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
            >
              {job.isActive !== false ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
              {job.isActive !== false ? 'Set Inactive' : 'Set Active'}
            </button>
            <Link
              to={`/jobs/${job._id}/rankings`}
              className="inline-flex items-center gap-1 rounded-xl bg-gold-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-gold-600"
            >
              🏆 View Rankings
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-500"
            >
              <Pencil size={13} /> Open in Admin Panel
            </Link>
            <button
              onClick={handleAdminDelete}
              className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
            >
              <Trash2 size={13} /> Delete Job
            </button>
          </div>
        </div>
      )}

      {/* Main Details Card */}
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-8 dark:border-slate-800 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400">
                <Building2 size={16} /> {job.company}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {job.jobType || job.employmentType || 'Full Time'}
              </span>
              {job.source && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {job.source}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                <MapPin size={13} /> {job.location}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                <Clock size={13} /> Experience: {job.experience || '0–2 years'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                <ShieldCheck size={13} /> Source: {job.source || 'Official Company Careers'}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Calendar size={13} /> Posted on {formatDate(job.postedDate || job.createdAt)}
              </span>
              {job.deadline && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <Clock size={13} /> Apply before {formatDate(job.deadline)}
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSaveJob}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                saved
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark size={16} />
              {saved ? 'Saved' : 'Save Job'}
            </button>

            {job.officialApplyUrl ? (
              <a
                href={job.officialApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-500"
              >
                Apply on Official Website <ExternalLink size={16} />
              </a>
            ) : applied ? (
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
              >
                <CheckCircle2 size={16} /> Application Submitted
              </button>
            ) : (
              <button
                onClick={handleDirectApply}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-500"
              >
                Apply Directly Now
              </button>
            )}
          </div>
        </div>

        {saveMessage && (
          <div className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {saveMessage}
          </div>
        )}

        {/* Quick Highlights Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Compensation</div>
            <div className="mt-1 font-bold text-slate-900 dark:text-white">
              {job.salary || 'Competitive / As per industry band'}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Role Type</div>
            <div className="mt-1 font-bold text-slate-900 dark:text-white">
              {job.jobType || job.employmentType || 'Full Time'}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Experience</div>
            <div className="mt-1 font-bold text-slate-900 dark:text-white">
              {job.experience || '0–2 years'}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Education Requirement</div>
            <div className="mt-1 font-bold text-slate-900 dark:text-white">
              {job.education || 'Graduate / Relevant Degree'}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Description & Summary</h2>
          <div className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line text-sm sm:text-base">
            {job.description}
          </div>
        </div>

        {/* Required Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Required Skills & Technologies</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListChecks size={18} className="text-brand-600 dark:text-brand-400" />
              Key Responsibilities
            </h3>
            <ul className="mt-4 space-y-2.5">
              {job.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    ✓
                  </span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Qualifications & Requirements */}
        {job.qualifications && job.qualifications.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap size={18} className="text-brand-600 dark:text-brand-400" />
              Qualifications & Requirements
            </h3>
            <ul className="mt-4 space-y-2.5">
              {job.qualifications.map((qual, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    •
                  </span>
                  <span>{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits & Perks */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift size={18} className="text-emerald-600 dark:text-emerald-400" />
              Benefits & Perks
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {job.benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
                >
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Verified Application Notice */}
        <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Official Application Assurance</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                This vacancy has been retrieved from <strong>{job.source || 'Official Company Careers'}</strong>. When
                you click &quot;Apply on Official Website&quot;, you will be securely redirected directly to the company&apos;s
                authorized careers portal to submit your candidacy.
              </p>
              {job.officialApplyUrl && (
                <div className="mt-4">
                  <a
                    href={job.officialApplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Proceed to Official Career Portal <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
