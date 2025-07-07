import { Router } from 'express';
import { asyncHandler } from '../../admin.middleware';
import { listPacks, createPack, updatePack, deletePack } from './animation-packs.controller';

const router = Router();

router.get('/', asyncHandler(listPacks));
router.post('/', asyncHandler(createPack));
router.put('/:id', asyncHandler(updatePack));
router.delete('/:id', asyncHandler(deletePack));

export default router;
