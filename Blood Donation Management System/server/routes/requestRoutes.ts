import { Router } from 'express';
import { getRequests, createRequest, updateRequest, deleteRequest } from '../controllers/requestController';

const router = Router();

router.get('/', getRequests);
router.post('/', createRequest);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);

export default router;
