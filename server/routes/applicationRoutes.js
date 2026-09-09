import express from 'express';
import { applyForJob, getApplicationsForJob, getMyApplications, getRecruiterCandidates, rerankCandidates, updateApplicationStatus } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/:jobId', protect, authorize('job_seeker'), applyForJob);
router.get('/my', protect, authorize('job_seeker'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getApplicationsForJob);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.post('/candidates/:jobId/rank', protect, authorize('recruiter', 'admin'), rerankCandidates);
router.get('/candidates', protect, authorize('recruiter', 'admin'), getRecruiterCandidates);

export default router;
