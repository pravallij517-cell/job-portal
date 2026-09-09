import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import api from '../services/api.js';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profile: {
      phone: '',
      location: '',
      professionalSummary: '',
      linkedin: '',
      github: '',
    },
    skills: [],
    education: [],
    experience: [],
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/user/profile');
        const userData = response.data.user;
        setProfile(userData);
        setSkillsInput((userData.skills || []).join(', '));
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: profile.name,
        profile: profile.profile,
        skills: skillsArray,
      };

      const response = await api.put('/user/profile', payload);
      setProfile(response.data.user);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
              Account Settings
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">Profile Details</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            Role: {profile.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
          </span>
        </div>

        {message && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={profile.email || ''}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={profile.profile?.phone || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profile: { ...(profile.profile || {}), phone: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={profile.profile?.location || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profile: { ...(profile.profile || {}), location: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  placeholder="Hyderabad, India"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Skills & Technologies (Comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                placeholder="React, Node.js, JavaScript, Python, MongoDB"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Professional Summary
              </label>
              <textarea
                rows={4}
                value={profile.profile?.professionalSummary || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    profile: { ...(profile.profile || {}), professionalSummary: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                placeholder="Brief summary of your professional background, core expertise, and career aspirations..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-500 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

