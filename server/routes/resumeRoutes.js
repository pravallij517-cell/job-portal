import express from 'express';
import { analyzeResume, deleteResume, getResume, uploadResume } from '../controllers/resumeController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../utils/fileUpload.js';

const router = express.Router();

router.post('/upload', protect, authorize('job_seeker'), upload.single('resume'), uploadResume);
router.get('/', protect, authorize('job_seeker'), getResume);
router.post('/analyze', protect, authorize('job_seeker'), analyzeResume);
router.delete('/', protect, authorize('job_seeker'), deleteResume);

export default router;
