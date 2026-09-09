import express from 'express';
import {
  createAdminJob,
  deleteJobByAdmin,
  deleteUser,
  getAdminJobs,
  getStatistics,
  getUsers,
  toggleJobStatus,
  updateAdminJob,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', protect, authorize('admin'), getUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

router.get('/jobs', protect, authorize('admin'), getAdminJobs);
router.post('/jobs', protect, authorize('admin'), createAdminJob);
router.put('/jobs/:id', protect, authorize('admin'), updateAdminJob);
router.patch('/jobs/:id/status', protect, authorize('admin'), toggleJobStatus);
router.delete('/jobs/:id', protect, authorize('admin'), deleteJobByAdmin);

router.get('/statistics', protect, authorize('admin'), getStatistics);

export default router;
