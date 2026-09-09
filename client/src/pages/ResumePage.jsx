import { useEffect, useState } from 'react';
import {
  Upload,
  Trash2,
  FileText,
  Award,
  Briefcase,
  Tag,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api.js';

export default function ResumePage() {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get('/resume');
        setResume(response.data.resume || null);
      } catch (err) {
        // No resume yet — normal
      }
    };
    fetchResume();
  }, []);

  const showMessage = (type, msg) => {
    if (type === 'error') setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 5000);
  };

  const handleUpload = async (selectedFile) => {
    const target = selectedFile || file;
    if (!target) return;
    const formData = new FormData();
    formData.append('resume', target);

    try {
      setUploadLoading(true);
      setError('');
      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(response.data.resume);
      setFile(null);
      showMessage('success', 'Resume uploaded! Click "Analyze with AI" to extract your skills.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/resume/analyze');
      setResume(response.data.resume);
      showMessage('success', '✨ Skills & profile extracted successfully from your resume!');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Analysis failed. Ensure your PDF/DOCX contains selectable text.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your resume? This will also clear your extracted skills.')) return;
    try {
      setLoading(true);
      await api.delete('/resume');
      setResume(null);
      showMessage('success', 'Resume deleted.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Delete failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      handleUpload(dropped);
    }
  };

  const isAnalyzed = resume && resume.extractedSkills && resume.extractedSkills.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-gold-500 p-8 text-white shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">AI Resume Analysis</h1>
            <p className="mt-1 text-brand-100">
              Upload your PDF or DOCX resume — our AI will extract your skills, education, and experience
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Upload Area */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Upload Resume</h2>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
            dragOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
              : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-800/50'
          }`}
        >
          <Upload size={32} className={`mb-3 ${dragOver ? 'text-brand-600' : 'text-slate-400'}`} />
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Drag & drop your resume here
          </p>
          <p className="mt-1 text-sm text-slate-400">or click to browse — PDF, DOC, DOCX (max 5MB)</p>
          <input
            id="resumeFileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) { setFile(f); handleUpload(f); }
            }}
          />
          {uploadLoading && (
            <div className="mt-4 flex items-center gap-2 text-brand-600">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          )}
        </div>

        {/* Current Resume Card */}
        {resume && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-brand-100 bg-brand-50/50 px-5 py-4 dark:border-brand-900 dark:bg-brand-950/20">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-600 p-2 text-white">
                <FileText size={16} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{resume.fileName}</p>
                <p className="text-xs text-slate-500">
                  {isAnalyzed ? `${resume.extractedSkills.length} skills extracted` : 'Not analyzed yet'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                id="analyzeResumeBtn"
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Analyzing...' : (isAnalyzed ? 'Re-analyze' : 'Analyze with AI')}
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                title="Delete resume"
                className="rounded-xl border border-red-200 p-2 text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {isAnalyzed && (
        <div className="mt-8 space-y-6">
          {/* Skills */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-xl bg-brand-100 p-2 text-brand-600 dark:bg-brand-950">
                <Tag size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extracted Skills</h3>
              <span className="ml-auto rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {resume.extractedSkills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.extractedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Job Titles */}
          {resume.jobTitles && resume.jobTitles.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-xl bg-gold-100 p-2 text-gold-600 dark:bg-gold-900/30">
                  <Briefcase size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detected Job Titles / Roles</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.jobTitles.map((title, i) => (
                  <span key={i} className="rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-sm font-medium text-gold-700 dark:border-gold-800 dark:bg-gold-900/20 dark:text-gold-300">
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education & Experience */}
          <div className="grid gap-6 md:grid-cols-2">
            {resume.education && resume.education.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950">
                    <Award size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Education</h3>
                </div>
                <ul className="space-y-2">
                  {resume.education.map((edu, i) => (
                    <li key={i} className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resume.experience && resume.experience.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Experience</h3>
                </div>
                <ul className="space-y-2">
                  {resume.experience.map((exp, i) => (
                    <li key={i} className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {exp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Keywords */}
          {resume.keywords && resume.keywords.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950">
                  <RefreshCw size={18} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">ATS Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.keywords.map((kw, i) => (
                  <span key={i} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state when uploaded but not analyzed */}
      {resume && !isAnalyzed && (
        <div className="mt-8 rounded-3xl border border-dashed border-brand-200 bg-brand-50/30 p-12 text-center dark:border-brand-800 dark:bg-brand-950/10">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Resume uploaded — ready for AI analysis
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Click "Analyze with AI" above to extract your skills and experience
          </p>
        </div>
      )}

      {/* No resume at all */}
      {!resume && !uploadLoading && (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          <FileText size={36} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">No resume uploaded yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Drag & drop or click the upload area above to get started
          </p>
        </div>
      )}
    </div>
  );
}
