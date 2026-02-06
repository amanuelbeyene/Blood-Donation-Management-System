import { Router } from 'express';
import { getAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, getAdminActivityLogs, getDashboardStats } from '../controllers/adminController';

const router = Router();

router.get('/', getAdmins);
router.get('/dashboard-stats', getDashboardStats);
router.get('/activity-logs', getAdminActivityLogs);
router.get('/:id', getAdminById);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

export default router;
