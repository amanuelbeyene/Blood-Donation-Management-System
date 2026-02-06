import { Router } from 'express';
import { getInventory, updateInventory, checkExpiration, getExpiredStock } from '../controllers/inventoryController';

const router = Router();

router.get('/', getInventory);
router.put('/:id', updateInventory);
router.post('/check-expiry', checkExpiration);
router.get('/expired', getExpiredStock);

export default router;
