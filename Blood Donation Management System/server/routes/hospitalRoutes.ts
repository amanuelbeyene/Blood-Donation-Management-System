import { Router } from 'express';
import { getHospitals, getHospitalById, registerHospital, updateHospital, deleteHospital } from '../controllers/hospitalController';

const router = Router();

router.get('/', getHospitals);
router.get('/:id', getHospitalById);
router.post('/', registerHospital);
router.put('/:id', updateHospital);
router.delete('/:id', deleteHospital);

export default router;
