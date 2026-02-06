import express from 'express';
import { drawWinners, getWinners } from '../controllers/awardController';

const router = express.Router();

// Draw winners (Admin only - practically)
router.post('/draw', drawWinners);

// Get current month winners (Public)
router.get('/winners', getWinners);

export default router;
