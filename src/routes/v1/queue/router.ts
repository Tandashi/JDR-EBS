import { Router } from 'express';

import { AuthJWT } from '@base/middleware/auth';
import QueueGetEndpoint from './get';
import QueuePostEndpoint from './post';

const router = Router();

router.get('/:id', AuthJWT, QueueGetEndpoint.get);
router.post('/:id', AuthJWT, QueuePostEndpoint.add);

export default router;
