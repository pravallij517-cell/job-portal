import express from 'express';
import { getDashboard } from '../controllers/jobController.js';
import { getRecruiterCandidates } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('recruiter', 'admin'), getDashboard);
router.get('/candidates', protect, authorize('recruiter', 'admin'), getRecruiterCandidates);

export default router;
