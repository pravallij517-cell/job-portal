import express from 'express';
import {
  createJob,
  deleteJob,
  getDashboard,
  getJobById,
  getJobs,
  getMyJobs,
  getRecommendedJobs,
  saveJob,
  getSavedJobs,
  updateJob,
  syncJobsHandler,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.get('/', getJobs);
router.get('/recommended', protect, getRecommendedJobs);
router.get('/saved', protect, getSavedJobs);
router.get('/my', protect, authorize('recruiter', 'admin'), getMyJobs);
router.get('/dashboard', protect, getDashboard);
router.post('/sync', syncJobsHandler);
router.get('/sync', syncJobsHandler);
router.get('/:id', getJobById);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/save/:jobId', protect, saveJob);

export default router;

