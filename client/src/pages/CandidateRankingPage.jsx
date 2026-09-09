import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Medal,
  Star,
  User,
  Mail,
  Briefcase,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  Tag,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api.js';

const statusConfig = {
  Applied: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: Clock },
  'Under Review': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', icon: Clock },
  Shortlisted: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: CheckCircle2 },
  Rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', icon: XCircle },
  Accepted: { color: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300', icon: CheckCircle2 },
};

const rankStyles = [
  { bg: 'from-gold-400 to-gold-600', text: 'text-white', icon: '🥇', label: '#1' },
  { bg: 'from-slate-300 to-slate-400', text: 'text-white', icon: '🥈', label: '#2' },
  { bg: 'from-amber-600 to-amber-700', text: 'text-white', icon: '🥉', label: '#3' },
];

function ScoreBadge({ score }) {
  const pct = Math.min(Math.round(score), 100);
  const color =
    pct >= 75 ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
    : pct >= 50 ? 'text-gold-600 bg-gold-50 border-gold-200 dark:bg-gold-900/20 dark:text-gold-400 dark:border-gold-800'
    : 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

  return (
    <div className={`inline-flex flex-col items-center rounded-2xl border px-4 py-2 ${color}`}>
      <span className="text-2xl font-black">{pct}%</span>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Match</span>
    </div>
  );
}

export default function CandidateRankingPage() {
  const { jobId } = useParams();
  const [ranked, setRanked] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [reranking, setReranking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [rankRes, jobRes] = await Promise.all([
          api.get(`/applications/candidates?jobId=${jobId}`),
          api.get(`/jobs/${jobId}`),
        ]);
        setRanked(rankRes.data.ranked || []);
        setJobTitle(jobRes.data.job?.title || 'Job');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) load();
  }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      await api.put(`/applications/${applicationId}/status`, { status });
      setRanked((prev) =>
        prev.map((c) =>
          c.applicationId?.toString() === applicationId?.toString() ? { ...c, status } : c
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const rerank = async () => {
    try {
      setReranking(true);
      const response = await api.post(`/applications/candidates/${jobId}/rank`);
      setRanked(response.data.ranked || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh candidate ranking');
    } finally {
      setReranking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-brand-600">
          <Loader2 size={36} className="animate-spin" />
          <p className="font-semibold">Ranking candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/jobs/${jobId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          <ChevronLeft size={16} /> Back to Job
        </Link>
        <div className="rounded-2xl border border-stone-200 bg-[#24343b] p-8 text-white shadow-xl dark:border-slate-700 dark:bg-[#17242a]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-brand-200 text-sm font-semibold uppercase tracking-wider">AI Candidate Ranking</p>
              <h1 className="mt-0.5 text-2xl font-extrabold sm:text-3xl">{jobTitle}</h1>
              <p className="mt-1 text-brand-100">
                {ranked.length} applicant{ranked.length !== 1 ? 's' : ''} ranked by AI match score
              </p>
            </div>
            </div>
            <button
              onClick={rerank}
              disabled={reranking || ranked.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={16} className={reranking ? 'animate-spin' : ''} />
              {reranking ? 'Re-ranking...' : 'Refresh ranking'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {ranked.length === 0 && !error && (
        <div className="rounded-3xl border border-dashed border-slate-200 p-16 text-center dark:border-slate-700">
          <User size={40} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">No candidates have applied yet</p>
          <p className="mt-2 text-sm text-slate-400">Share the job link to start receiving applications</p>
        </div>
      )}

      {/* Top 3 Podium */}
      {ranked.length >= 1 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {ranked.slice(0, 3).map((candidate, i) => {
            const style = rankStyles[i] || rankStyles[2];
            return (
              <div
                key={candidate.userId}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.bg} p-6 text-white shadow-gold`}
              >
                <div className="absolute right-4 top-4 text-4xl opacity-30">{style.icon}</div>
                <div className="text-4xl font-black opacity-90">{style.icon}</div>
                <div className="mt-3 font-bold text-lg leading-tight">{candidate.name}</div>
                <div className="mt-1 text-sm opacity-80">{candidate.email}</div>
                <div className="mt-4 text-3xl font-black">{Math.round(candidate.matchScore)}%</div>
                <div className="text-xs opacity-70 uppercase tracking-wider">Match Score</div>
                {candidate.skills.slice(0, 3).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full Ranked List */}
      <div className="space-y-4">
        {ranked.map((candidate, i) => {
          const StatusIcon = statusConfig[candidate.status]?.icon || Clock;
          return (
            <div
              key={candidate.userId || i}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                {/* Rank Badge */}
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg ${
                    i === 0 ? 'bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400'
                    : i === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    : i === 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400'
                  }`}>
                    #{i + 1}
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{candidate.name}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusConfig[candidate.status]?.color || statusConfig.Applied.color}`}>
                          <StatusIcon size={11} />
                          {candidate.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Mail size={13} />
                        {candidate.email}
                      </div>
                    </div>
                    <ScoreBadge score={candidate.matchScore} />
                  </div>

                  {/* Explanation */}
                  {candidate.matchExplanation && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      {candidate.matchExplanation}
                    </p>
                  )}

                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {candidate.skills.slice(0, 8).map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 8 && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                          +{candidate.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Update Status:</span>
                    {['Under Review', 'Shortlisted', 'Rejected', 'Accepted'].map((s) => (
                      <button
                        key={s}
                        disabled={candidate.status === s || updatingId === candidate.applicationId}
                        onClick={() => updateStatus(candidate.applicationId, s)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          candidate.status === s
                            ? 'bg-brand-600 text-white cursor-default'
                            : 'border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {updatingId === candidate.applicationId ? '...' : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
