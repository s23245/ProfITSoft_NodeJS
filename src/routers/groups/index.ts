import express from 'express';
import {
  listGroups,
  saveGroup,
} from '../../controllers/groups';

const router = express.Router();

router.get('', listGroups);
router.post('', saveGroup);

export default router;
