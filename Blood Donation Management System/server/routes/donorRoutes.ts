import { Router } from 'express';
import { registerDonor, getDonors, getDonorById, updateDonor, deleteDonor, notifyDonor } from '../controllers/donorController';

const router = Router();

router.post('/', registerDonor);
router.get('/', getDonors);
router.get('/:id', getDonorById);
router.put('/:id', updateDonor);
router.delete('/:id', deleteDonor);
router.post('/:id/notify', notifyDonor);

export default router;
