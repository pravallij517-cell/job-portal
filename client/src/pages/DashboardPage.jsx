import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/jobs/dashboard');
        setStats(response.data.stats || {});
      } catch (error) {
        console.error('Dashboard load failed:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadDashboard();
  }, [user]);

  const isJobSeeker = user?.role === 'job_seeker';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 p-8 text-white shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
              {isJobSeeker ? 'Candidate workspace' : user?.role === 'admin' ? 'Creator workspace' : 'Recruiter workspace'}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Welcome back, {user?.name || 'Candidate'}
            </h1>
            <p className="mt-2 text-cyan-100">
              {isJobSeeker
                ? 'Track your application status, explore verified opportunities, and update your AI resume.'
                : 'Manage requisitions, review qualified candidates, and monitor recruitment analytics.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' ? (
              <>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-600 shadow-soft transition hover:bg-cyan-50"
                >
                  <Briefcase size={16} /> Creator desk
                </Link>
                <Link
                  to="/post-job"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-white/20 backdrop-blur-md"
                >
                  <PlusCircle size={16} /> Post Job
                </Link>
              </>
            ) : isJobSeeker ? (
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-600 shadow-soft transition hover:bg-cyan-50"
              >
                <Briefcase size={16} /> Explore Jobs
              </Link>
            ) : (
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-600 shadow-soft transition hover:bg-cyan-50"
              >
                <PlusCircle size={16} /> Post a Job
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : isJobSeeker ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Applications</span>
              <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950">
                <FileText size={18} />
              </div>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalApplications || 0}
            </div>
            <div className="mt-2 text-xs text-slate-500">Submitted candidates</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shortlisted</span>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
              {stats.shortlisted || 0}
            </div>
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">Under active review</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saved Jobs</span>
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950">
                <Bookmark size={18} />
              </div>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
              {stats.savedJobs || 0}
            </div>
            <div className="mt-2 text-xs text-slate-500">Bookmarks in your list</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified Openings</span>
              <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600 dark:bg-cyan-950">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalJobs || 0}
            </div>
            <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-400">Available to apply now</div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Postings</span>
              <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950">
                <Briefcase size={18} />
              </div>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{stats.totalJobs || 0}</div>
            <div className="mt-2 text-xs text-slate-500">Published opportunities</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Applicants</span>
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{stats.totalApplicants || 0}</div>
            <div className="mt-2 text-xs text-slate-500">Candidate submissions</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shortlisted</span>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{stats.shortlisted || 0}</div>
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">Qualified candidates</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Talent Pool</span>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{stats.candidates || 0}</div>
            <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-400">Registered job seekers</div>
          </div>
        </div>
      )}

      {/* Quick Access Section */}
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isJobSeeker ? (
            <>
              <Link
                to="/jobs"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Explore Verified Jobs</div>
                  <div className="mt-1 text-xs text-slate-500">Browse official company career listings</div>
                </div>
                <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>

              <Link
                to="/resume"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">AI Resume Analysis</div>
                  <div className="mt-1 text-xs text-slate-500">Upload and extract skill highlights</div>
                </div>
                <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>

              <Link
                to="/applications"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">My Applications</div>
                  <div className="mt-1 text-xs text-slate-500">Check current submission progress</div>
                </div>
                <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/post-job"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Publish New Opportunity</div>
                  <div className="mt-1 text-xs text-slate-500">Post a new job requisition</div>
                </div>
                <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>

              <Link
                to="/jobs"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">View Active Postings</div>
                  <div className="mt-1 text-xs text-slate-500">Manage all listed requisitions</div>
                </div>
                <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>

              <Link
                to="/profile"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Organization Profile</div>
                  <div className="mt-1 text-xs text-slate-500">Update company details and branding</div>
                </div>
                <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

