import { Router } from 'express';
import {
  saveFight,
  getFightsByHeroIdController,
  countFightsByHeroIdsController,
} from '../../controllers/fight';

const router = Router();

router.post('/', saveFight);
router.get('/', getFightsByHeroIdController);
router.post('/_counts', countFightsByHeroIdsController);

export default router;