import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const response = await api.get('/jobs/saved');
        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadSaved();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-3xl font-bold">Saved Jobs</h2>
        <div className="mt-8 space-y-4">
          {jobs.filter(Boolean).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-700">
              You have no saved jobs yet. Explore jobs to bookmark opportunities!
            </div>
          ) : (
            jobs.filter(Boolean).map((job) => (
              <div key={job._id} className="flex flex-col justify-between gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800 sm:flex-row sm:items-center">
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</div>
                  <div className="text-sm font-semibold text-brand-600 dark:text-brand-400">{job.company} • {job.location}</div>
                  <div className="mt-1 text-xs text-slate-500">Source: {job.source || 'Official Company Careers'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/jobs/${job._id}`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    View Details
                  </a>
                  {job.officialApplyUrl && (
                    <a
                      href={job.officialApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-brand-500"
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}
