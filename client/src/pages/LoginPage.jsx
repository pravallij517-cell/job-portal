import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', form);
      login(response.data.user, response.data.token);
      if (response.data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center px-4 py-12">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2">
        {/* Left Visual Card */}
        <div className="bg-gradient-to-br from-brand-600 via-indigo-600 to-cyan-500 p-8 text-white sm:p-12">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex rounded-2xl bg-white/10 p-3 backdrop-blur-md">
                <LockKeyhole size={28} />
              </div>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Welcome back</h2>
              <p className="mt-4 max-w-sm text-cyan-50 leading-relaxed">
                Sign in to manage your jobs, candidates, applications, and dynamic hiring command center.
              </p>
            </div>

            <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck size={18} className="text-cyan-200" />
                <span>One workspace, the right tools</span>
              </div>
              <p className="mt-1.5 text-xs text-cyan-100">
                Your workspace adapts to whether you are discovering roles, hiring talent, or shaping the marketplace.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h3>
              <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Username or Email
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 font-semibold text-white shadow-soft transition hover:bg-brand-500 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-sm">
              <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                Create new account
              </Link>
              <span className="text-xs text-slate-400">Secure access for every role</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
