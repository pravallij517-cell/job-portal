import express from 'express';
import { analyzeResumeAi, matchJobAi, rankCandidatesAi } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze-resume', protect, analyzeResumeAi);
router.post('/match-job', protect, matchJobAi);
router.post('/rank-candidates', protect, rankCandidatesAi);

export default router;
