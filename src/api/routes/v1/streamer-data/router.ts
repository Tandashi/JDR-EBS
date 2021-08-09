import { Router } from 'express';

import { AuthJWT, BroadcasterOnly } from '@api/middleware/auth';

import StreamerDataGetEndpoint from './get';
import StreamerDataPatchEndpoint from './patch';

const router = Router();

router.get('/', AuthJWT, BroadcasterOnly, StreamerDataGetEndpoint.get);
router.patch('/secret', AuthJWT, BroadcasterOnly, StreamerDataPatchEndpoint.updateSecret);

export default router;
