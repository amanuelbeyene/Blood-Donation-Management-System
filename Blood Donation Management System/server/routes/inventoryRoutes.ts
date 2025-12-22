import { Router } from 'express';
import { getInventory, updateInventory } from '../controllers/inventoryController';

const router = Router();

router.get('/', getInventory);
router.put('/:id', updateInventory);

export default router;
