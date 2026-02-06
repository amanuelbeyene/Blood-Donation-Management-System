import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';

const router = express.Router();

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export default router;
