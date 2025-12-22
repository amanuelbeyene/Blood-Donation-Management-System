import { Router } from 'express';
import { registerDonor, getDonors, getDonorById, updateDonor, deleteDonor } from '../controllers/donorController';

const router = Router();

router.post('/', registerDonor);
router.get('/', getDonors);
router.get('/:id', getDonorById);
router.put('/:id', updateDonor);
router.delete('/:id', deleteDonor);

export default router;
