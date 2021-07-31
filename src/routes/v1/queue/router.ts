import { Router } from 'express';

import { AuthJWT } from '@base/middleware/auth';
import QueueGetEndpoint from './get';
import QueuePostEndpoint from './post';

const router = Router();

router.get('/:channelId', QueueGetEndpoint.get);
router.post('/', AuthJWT, QueuePostEndpoint.add);

export default router;
