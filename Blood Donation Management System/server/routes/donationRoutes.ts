import { Router } from 'express';
import { getDonations, createDonation, updateDonation } from '../controllers/donationController';

const router = Router();

router.get('/', getDonations);
router.post('/', createDonation);
router.put('/:id', updateDonation);

export default router;
