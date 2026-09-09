import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  BriefcaseBusiness,
  Users,
  BarChart3,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api.js';

const featuresList = [
  {
    title: 'AI Job Matching',
    description: 'Match your skills, education, and experience against verified job requirements using intelligent scoring algorithms.',
    icon: BrainCircuit,
    to: '/jobs',
    actionText: 'Find Matches',
    badge: 'Smart Matching',
  },
  {
    title: 'Smart Resume Analysis',
    description: 'Upload your resume to extract core competencies, identify skill gaps, and get AI-driven career recommendations.',
    to: '/resume',
    actionText: 'Analyze Resume',
    badge: 'AI Powered',
  },
  {
    title: 'Candidate Ranking',
    description: 'Evaluate applicants with objective compatibility scores and ranked candidate insights for faster, unbiased hiring.',
    icon: BarChart3,
    to: '/dashboard',
    actionText: 'View Pipeline',
    badge: 'Recruiter Tool',
  },
  {
    title: 'Easy Job Search',
    description: 'Filter real active jobs by title, skills, company, location, experience level, and official company careers portals.',
    icon: BriefcaseBusiness,
    to: '/jobs',
    actionText: 'Search Openings',
    badge: 'Verified Feed',
  },
  {
    title: 'Application Tracking',
    description: 'Stay on top of every submission with transparent stage updates from review to shortlisting and offer.',
    icon: CheckCircle2,
    to: '/applications',
    actionText: 'Track Status',
    badge: 'Live Updates',
  },
  {
    title: 'Recruiter & Admin Dashboard',
    description: 'Publish open requisitions, review qualified applicants, and manage recruitment metrics with full authority.',
    icon: Users,
    to: '/dashboard',
    actionText: 'Manage Hiring',
    badge: 'Full Control',
  },
];

const steps = ['Create Profile', 'Upload Resume', 'AI Analysis', 'Get Matched', 'Apply / Hire'];

const testimonials = [
  {
    name: 'Aisha Khan',
    role: 'Frontend Developer',
    quote: 'The AI recommendations helped me focus on the right roles and improved my interview process dramatically.',
  },
  {
    name: 'Rohan Mehta',
    role: 'Talent Lead',
    quote: 'The recruiter dashboard makes candidate shortlisting faster and more accurate for high-volume hiring.',
  },
  {
    name: 'Nadia Hussain',
    role: 'Product Designer',
    quote: 'I found a role that matched my skills perfectly within days of updating my profile and resume.',
  },
];

const faqs = [
  { q: 'How does job matching work?', a: 'The system compares candidate skills, education, experience, and job requirements with AI scoring to recommend high-fit opportunities.' },
  { q: 'Can administrators publish and manage jobs?', a: 'Yes. Administrators have full authority to add, update, toggle visibility, and remove dynamic job opportunities with complete details.' },
  { q: 'Can I upload my resume?', a: 'Absolutely. Job seekers can upload PDF, DOC, or DOCX resume files and analyze them with Groq-powered AI.' },
  { q: 'Is the platform secure?', a: 'Yes. Authentication, authorization, JWT protection, CORS, rate limiting, and role-based access control are implemented across the platform.' },
];

export default function LandingPage() {
  const location = useLocation();
  const [recentJobs, setRecentJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [totalJobCount, setTotalJobCount] = useState(0);

  useEffect(() => {
    if (location.hash) {
      const elem = document.querySelector(location.hash);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setLoadingJobs(true);
        const response = await api.get('/jobs');
        const allJobs = response.data.jobs || [];
        setTotalJobCount(allJobs.length);
        setRecentJobs(allJobs.slice(0, 6));
      } catch (err) {
        console.error('Failed to load recent dynamic jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchRecentJobs();
  }, []);

  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[620px] overflow-hidden bg-[#302118] text-white">
        <img src="/hero-workspace.jpg" alt="Warm modern workspace" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[#302118]/70" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.28em] text-gold-300">Your skills, our opportunity</p>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
              Find work worthy of your ambition.
            </motion.h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#f3e5b8] sm:text-xl">
              Thoughtful tools for discovering meaningful opportunities, presenting your strengths, and making confident hiring decisions.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/jobs" className="rounded-lg bg-gold-500 px-6 py-3.5 font-bold text-brand-950 hover:bg-gold-400">Explore open roles</Link>
              <Link to="/register" className="rounded-lg border border-white/35 px-6 py-3.5 font-bold text-white hover:bg-white/10">Create your profile</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cbb8] bg-[#eee8de]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            ['For candidates', 'Build a clear profile, understand your fit, and keep every application in view.', '/register', 'Create a candidate profile'],
            ['For recruiters', 'Publish precise roles and review applicants against the requirements that matter.', '/login', 'Open the hiring workspace'],
            ['For creators', 'Shape the marketplace, curate live opportunities, and keep the platform trustworthy.', '/login', 'Enter the workspace'],
          ].map(([label, description, to, action]) => (
            <div key={label} className="border-l-2 border-gold-500 pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">{label}</p>
              <p className="mt-3 text-sm leading-6 text-brand-800">{description}</p>
              <Link to={to} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-gold-700">{action} <ArrowRight size={15} /></Link>
            </div>
          ))}
        </div>
      </section>

      {/* DYNAMIC RECENT JOBS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <ShieldCheck size={14} /> Live Openings Feed
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Latest Dynamic Opportunities
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Current openings from verified hiring teams and curated employment feeds.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            View All Openings ({totalJobCount}) <ArrowRight size={16} />
          </Link>
        </div>

        {loadingJobs ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-500">No openings are available yet. Please check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                      <Building2 size={14} /> {job.company}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {job.jobType || job.employmentType || 'Full Time'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                    {job.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {job.location}
                    </span>
                    <span>💰 {job.salary || 'Competitive'}</span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {job.description}
                  </p>

                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-xs font-bold text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-800 dark:text-brand-400 dark:group-hover:bg-brand-600 dark:group-hover:text-white"
                  >
                    <span>View Role & Apply</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Core Platform Features */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Core Platform Features</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Recruitment Reimagined With Intelligence</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Explore our comprehensive suite of career acceleration and intelligent hiring tools. Every feature is fully connected and ready to use.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuresList.map((feature) => {
            return (
              <div
                key={feature.title}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    {feature.icon && (
                      <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950 dark:text-brand-300">
                        <feature.icon size={24} />
                      </div>
                    )}
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    to={feature.to}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-800 dark:text-brand-400 dark:group-hover:bg-brand-600 dark:group-hover:text-white"
                  >
                    <span>{feature.actionText}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">How it works</p>
          <h2 className="mt-3 text-3xl font-bold">Simple steps to smarter hiring</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{index + 1}</div>
              <div className="font-semibold">{step}</div>
            </div>
          ))}
        </div>
      </section>

      {/* For Job Seekers */}
      <section id="for-job-seekers" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-cyan-500 p-8 text-white shadow-soft">
          <div className="grid md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-200">For candidates</p>
              <h3 className="mt-3 text-3xl font-bold">Build a stronger career profile</h3>
              <ul className="mt-6 space-y-3 text-cyan-50">
                <li>• AI-powered resume insights and skill analysis</li>
                <li>• Personalized job recommendations and match scores</li>
                <li>• Track applications and save ideal opportunities</li>
              </ul>
            </div>
            <div className="mt-8 md:mt-0 grid gap-4">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-cyan-100">Best fit for you</p>
                <p className="mt-2 text-xl font-bold">Full Stack Developer</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-cyan-100">Suggested next step</p>
                <p className="mt-2 text-xl font-bold">Improve SQL and Cloud skills</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Recruiters & Creators */}
      <section id="for-recruiters" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">For recruiters & creators</p>
            <h3 className="mt-3 text-3xl font-bold">Discover the right candidates faster</h3>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Hiring teams can publish precise requisitions, manage active listings, review candidate pipelines, and use objective matching.
            </p>
            <div className="mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft">
                Open the hiring workspace <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Top Candidate Compatibility</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600">High match</span>
            </div>
            <div className="mt-6 space-y-4">
              {[
                ['Priya S.', 94, 'React, Node.js, MongoDB'],
                ['Amir T.', 91, 'MERN Stack, AWS, Docker'],
                ['Aman G.', 88, 'TypeScript, System Design'],
              ].map(([name, score, skills]) => (
                <div key={name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div>
                    <div className="font-semibold">{name}</div>
                    <div className="text-sm text-slate-500">{skills}</div>
                  </div>
                  <div className="text-lg font-bold text-brand-600">{score}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Testimonials</p>
          <h2 className="mt-3 text-3xl font-bold">Loved by modern hiring teams</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((person) => (
            <div key={person.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {person.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold">{person.name}</div>
                  <div className="text-sm text-slate-500">{person.role}</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300">“{person.quote}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold">Questions people ask</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="font-semibold">{item.q}</div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="border-y border-gold-500/50 bg-[#eee8de] p-10 text-center text-brand-900 shadow-soft dark:bg-[#2b211b] dark:text-[#f7f1e8]">
          <h3 className="text-3xl font-bold">Ready to explore active opportunities?</h3>
          <p className="mt-2 text-sm text-brand-700 dark:text-gold-200">Find your next considered move, or meet the people who can make it happen.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/jobs" className="rounded-lg bg-brand-800 px-6 py-3 font-semibold text-white hover:bg-brand-700">
              Explore All Jobs
            </Link>
            <Link to="/register" className="rounded-lg border border-brand-300 px-6 py-3 font-semibold text-brand-800 hover:bg-gold-100 dark:border-gold-400 dark:text-gold-200 dark:hover:bg-white/10">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
