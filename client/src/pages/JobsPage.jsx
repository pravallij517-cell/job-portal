import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import api from '../services/api.js';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};

      if (search.trim()) params.search = search.trim();
      if (selectedCompany.trim()) params.company = selectedCompany.trim();
      if (selectedLocation.trim()) params.location = selectedLocation.trim();
      if (selectedJobType !== 'All') params.jobType = selectedJobType;
      if (selectedExperience !== 'All') params.experience = selectedExperience;
      if (sortBy) params.sort = sortBy;

      const response = await api.get('/jobs', { params });
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Unable to load jobs. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, selectedCompany, selectedLocation, selectedJobType, selectedExperience, sortBy]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCompany('');
    setSelectedLocation('');
    setSelectedJobType('All');
    setSelectedExperience('All');
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(
    search || selectedCompany || selectedLocation || selectedJobType !== 'All' || selectedExperience !== 'All'
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently posted';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently posted';
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    if (diffDays < 30) return `Posted ${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 p-8 text-white shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur-sm">
              <ShieldCheck size={14} /> Verified Official Jobs
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Explore Available Opportunities</h1>
            <p className="mt-2 max-w-2xl text-cyan-100">
              Browse genuine vacancies directly from official company careers portals and legitimate employment feeds.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <span className="block text-3xl font-bold">{loading ? '...' : jobs.length}</span>
            <span className="text-xs uppercase tracking-wider text-cyan-200">Active Openings</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-12">
          {/* Main search input */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
              placeholder="Search by title, skills, company, or keywords..."
            />
          </div>

          {/* Location input */}
          <div className="relative md:col-span-3">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
              placeholder="Location (e.g. Hyderabad, Remote)"
            />
          </div>

          {/* Company input */}
          <div className="relative md:col-span-3">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
              placeholder="Company (e.g. Google, TCS)"
            />
          </div>
        </div>

        {/* Second Row: Dropdown Filters */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Job Type */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Job Type:</label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Part Time">Part Time</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Experience:</label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">Any Experience</option>
                <option value="0–2">0–2 years (Entry Level)</option>
                <option value="1–3">1–3 years (Associate)</option>
                <option value="2–5">2–5 years (Mid Level)</option>
                <option value="5+">5+ years (Senior)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="company-az">Company (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Reset Filters & Status */}
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw size={14} /> Clear Filters
              </button>
            )}
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Showing {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={fetchJobs}
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading jobs...</p>
        </div>
      )}

      {/* Empty States */}
      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Briefcase size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {hasActiveFilters ? 'No jobs found matching your search.' : 'No jobs available at the moment.'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {hasActiveFilters
              ? 'Try adjusting your search criteria, clearing filters, or searching for broader terms.'
              : 'Our verified feed is currently updating. Please check back shortly for new openings.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-500"
            >
              <RotateCcw size={16} /> Restore All Jobs
            </button>
          )}
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && !error && jobs.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <div>
                {/* Header: Company & Employment Type */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                      <Building2 size={16} />
                      <span>{job.company}</span>
                    </div>
                    <h2 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                      {job.title}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {job.jobType || job.employmentType || 'Full Time'}
                  </span>
                </div>

                {/* Location & Experience Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    <MapPin size={12} /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    <Clock size={12} /> {job.experience || '0–2 years'}
                  </span>
                </div>

                {/* Description snippet */}
                <p className="mt-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                  {job.description}
                </p>

                {/* Skills tags */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400 dark:bg-slate-800/60">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata, Source, and Actions */}
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                {/* Source Badge & Posted Date */}
                <div className="mb-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck size={14} />
                    <span>Source: {job.source || 'Official Company Careers'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Calendar size={12} /> {formatDate(job.postedDate || job.createdAt)}
                  </span>
                </div>

                {/* Salary Info */}
                {job.salary && (
                  <div className="mb-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    💰 {job.salary}
                  </div>
                )}

                {/* Action Buttons: View Details & Apply Now */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    View Details
                  </Link>

                  {job.officialApplyUrl ? (
                    <a
                      href={job.officialApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-soft transition hover:bg-brand-500"
                    >
                      Apply Now <ExternalLink size={12} />
                    </a>
                  ) : (
                    <Link
                      to={`/jobs/${job._id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-soft transition hover:bg-brand-500"
                    >
                      Apply Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

