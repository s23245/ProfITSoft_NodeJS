import {Router} from 'express';
import ping from '../controllers/ping';
import groups from './groups';
import students from './students';
import fights from './fights';

const router = Router();

router.get('/ping', ping);

router.use('/groups', groups);
router.use('/students', students);
router.use('/fights',fights);

export default router;
