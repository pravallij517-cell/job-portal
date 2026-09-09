import { Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import JobsPage from './pages/JobsPage.jsx';
import JobDetailsPage from './pages/JobDetailsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ResumePage from './pages/ResumePage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';
import SavedJobsPage from './pages/SavedJobsPage.jsx';
import PostJobPage from './pages/PostJobPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CandidateRankingPage from './pages/CandidateRankingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { useTheme } from './context/ThemeContext.jsx';

const AppShell = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-[#f7f4ee] text-[#2b211b] transition-colors dark:bg-[#211914] dark:text-[#f7f1e8]">
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['job_seeker', 'recruiter', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['job_seeker', 'recruiter', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute allowedRoles={['job_seeker']}>
              <ResumePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['job_seeker']}>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute allowedRoles={['job_seeker']}>
              <SavedJobsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
              <PostJobPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:jobId/rankings"
          element={
            <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
              <CandidateRankingPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
};

export default App;
