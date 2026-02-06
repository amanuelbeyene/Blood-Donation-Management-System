import { Router } from 'express';
import { login, registerDonor, registerHospital, updatePassword, forgotPassword, resetPassword } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register/donor', registerDonor);
router.post('/register/hospital', registerHospital);
router.post('/update-password', updatePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// router.post('/register/staff', registerStaff); // If needed


export default router;
