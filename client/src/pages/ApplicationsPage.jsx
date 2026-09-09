import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const response = await api.get('/applications/my');
        setApplications(response.data.applications || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadApps();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-3xl font-bold">Applications</h2>

        <div className="mt-8 space-y-4">
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-700">No applications yet</div>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xl font-bold">{app.jobId?.title || 'Job Title'}</div>
                    <div className="text-sm text-slate-500">{app.jobId?.company || ''}</div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600 dark:bg-brand-950">{app.status}</span>
                </div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Match Score: {app.matchScore || 0}%</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
