import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[#d9cbb8] bg-[#eee8de] dark:border-[#59483a] dark:bg-[#2b211b]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/Nova.png" alt="Nova Job Portal" className="h-16 w-16 object-contain" />
            <div>
              <h3 className="text-xl font-bold text-brand-800 dark:text-gold-300">Nova</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-700 dark:text-gold-300">Job Portal</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-slate-600 dark:text-slate-300">
            Your skills, our opportunity.
          </p>
        </div>

        <div>
          <h4 className="font-semibold">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li><Link to="/jobs">Jobs</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">For Job Seekers</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li><Link to="/jobs">Search Jobs</Link></li>
            <li><Link to="/resume">Resume</Link></li>
            <li><Link to="/applications">Applications</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">For Recruiters</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li><Link to="/post-job">Post Job</Link></li>
            <li><Link to="/dashboard">Talent Pipeline</Link></li>
            <li><Link to="/jobs">Candidates</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
