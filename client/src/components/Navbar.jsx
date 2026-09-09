import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Moon, SunMedium, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'About', to: '/#about' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'For Recruiters', to: '/#for-recruiters' },
  { label: 'For Job Seekers', to: '/#for-job-seekers' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLinks = {
    job_seeker: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Find Jobs', to: '/jobs' },
      { label: 'Applications', to: '/applications' },
      { label: 'Saved Jobs', to: '/saved-jobs' },
      { label: 'Resume', to: '/resume' },
      { label: 'Profile', to: '/profile' },
    ],
    recruiter: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Post Job', to: '/post-job' },
      { label: 'Jobs', to: '/jobs' },
      { label: 'Profile', to: '/profile' },
    ],
    admin: [
      { label: 'Creator Desk', to: '/admin' },
      { label: 'Publish Role', to: '/post-job' },
      { label: 'Live Roles', to: '/jobs' },
      { label: 'Overview', to: '/dashboard' },
    ],
  };

  const links = user ? roleLinks[user.role] || roleLinks.job_seeker : navItems;

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="glass-nav relative mx-auto flex max-w-7xl items-center justify-between overflow-hidden rounded-2xl border border-white/60 bg-[#fbfaf7]/70 px-4 py-3 shadow-xl shadow-brand-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-[#211914]/65 sm:px-6 lg:px-8">
        <span className="glass-nav__shine" aria-hidden="true" />
        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <img
            src="/Nova.png"
            alt="Nova Job Portal"
            className="nav-logo h-12 w-12 object-contain sm:h-14 sm:w-14"
          />
          <div>
            <div className="text-base font-extrabold leading-tight">
              <span className="text-brand-800 dark:text-gold-300">Nova</span>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-600 dark:text-gold-200">
              Your skills, our opportunity
            </div>
          </div>
        </Link>

        <nav className="relative z-10 hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => {
                if (item.to.includes('#')) {
                  const hash = item.to.split('#')[1];
                  const elem = document.getElementById(hash);
                  if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className={({ isActive }) =>
                `nav-link relative py-2 text-sm font-medium transition ${isActive ? 'is-active text-brand-700 dark:text-gold-300' : 'text-slate-600 hover:text-brand-800 dark:text-slate-300 dark:hover:text-white'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>


        <div className="relative z-10 flex items-center gap-3">
          <button onClick={toggleTheme} title="Change theme" className="rounded-lg border border-[#d9cbb8] p-2 text-brand-700 dark:border-[#59483a] dark:text-gold-300">
            {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold dark:bg-slate-800 md:flex">
                <UserCircle2 size={16} />
                <span>{user.name}</span>
                {user.role === 'admin' && (
                  <span className="rounded-full bg-brand-600/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                    Admin
                  </span>
                )}
              </div>
              <button onClick={handleLogout} className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white dark:bg-gold-500 dark:text-brand-950">
                Logout
              </button>
              <Link to="/login" className="hidden rounded-lg border border-[#d9cbb8] px-3 py-2 text-sm font-semibold text-brand-700 dark:border-[#59483a] dark:text-gold-300 sm:inline-flex">
                Login
              </Link>
              <Link to="/register" className="hidden rounded-lg border border-gold-500 px-3 py-2 text-sm font-semibold text-gold-700 dark:text-gold-300 sm:inline-flex">
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
                Login
              </Link>
                <Link to="/register" className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-soft">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
