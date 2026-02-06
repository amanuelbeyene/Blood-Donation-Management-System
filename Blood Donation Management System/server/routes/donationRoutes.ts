import { Router } from 'express';
import { getDonations, createDonation, updateDonation, recordTestResult, completeDonation, resetTestStatus, removeAppointment } from '../controllers/donationController';

const router = Router();

router.get('/', getDonations);
router.post('/', createDonation);
router.put('/:id', updateDonation);
router.post('/test-result', recordTestResult);
router.post('/complete', completeDonation);
router.post('/reset-test', resetTestStatus);
router.post('/remove-appointment', removeAppointment);

export default router;
