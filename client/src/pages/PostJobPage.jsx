import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api.js';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    skills: '',
    location: '',
    employmentType: 'Full Time',
    jobType: 'Full Time',
    experience: '0–2 years',
    education: 'Bachelor’s degree or equivalent experience',
    salary: 'Competitive / As per industry standards',
    officialApplyUrl: '',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    responsibilities: '',
    qualifications: '',
    benefits: '',
  });

  const [message, setMessage] = useState('');
  const [createdJobId, setCreatedJobId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/jobs', {
        ...form,
        skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split('\n').map((s) => s.trim().replace(/^[-•*]\s*/, '')).filter(Boolean),
        qualifications: form.qualifications.split('\n').map((s) => s.trim().replace(/^[-•*]\s*/, '')).filter(Boolean),
        benefits: form.benefits.split('\n').map((s) => s.trim().replace(/^[-•*]\s*/, '')).filter(Boolean),
      });

      setMessage('Job published successfully! It is now dynamic and visible to all users.');
      setCreatedJobId(response.data.job?._id);
      setForm({
        title: '',
        company: '',
        description: '',
        skills: '',
        location: '',
        employmentType: 'Full Time',
        jobType: 'Full Time',
        experience: '0–2 years',
        education: 'Bachelor’s degree or equivalent experience',
        salary: 'Competitive / As per industry standards',
        officialApplyUrl: '',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responsibilities: '',
        qualifications: '',
        benefits: '',
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="border-b border-slate-100 pb-6 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            Dynamic Requisition Publisher
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Publish a New Job Opening</h2>
          <p className="mt-1 text-sm text-slate-500">
            Publish an opportunity with complete role specifications. It will dynamically appear in search and recommendation feeds.
          </p>
        </div>

        {message && (
          <div
            className={`mt-6 rounded-2xl p-4 text-sm font-medium ${
              createdJobId
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>{message}</span>
              </div>
              {createdJobId && (
                <Link
                  to={`/jobs/${createdJobId}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  View Live Job <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Job Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Company *
              </label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. TechCorp Solutions"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Location *
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Mumbai, India / Remote"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Employment Type
              </label>
              <select
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value, jobType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Experience Level
              </label>
              <input
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. 1–3 years"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Salary / Compensation
              </label>
              <input
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. ₹10,00,000 - ₹18,00,000 PA"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Education Requirement
              </label>
              <input
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Bachelor’s degree in CS or relevant experience"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Official Apply URL (Optional)
              </label>
              <input
                type="url"
                value={form.officialApplyUrl}
                onChange={(e) => setForm({ ...form, officialApplyUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="https://company.com/careers/job/123"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Required Skills (Comma separated)
              </label>
              <input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="React, Node.js, MongoDB, TypeScript, AWS"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Job Description *
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Provide a comprehensive role overview..."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Responsibilities (Newline separated)
              </label>
              <textarea
                rows={4}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="• Deliver scalable web applications&#10;• Write clean unit tests"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Qualifications (Newline separated)
              </label>
              <textarea
                rows={4}
                value={form.qualifications}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="• 2+ years of experience with React&#10;• Experience with database design"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-500 disabled:opacity-60"
            >
              {loading ? 'Publishing...' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
