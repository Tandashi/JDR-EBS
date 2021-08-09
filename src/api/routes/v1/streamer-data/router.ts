import { Router } from 'express';

import { AuthJWT, BroadcasterOnly } from '@api/middleware/auth';

import StreamerDataPatchEndpoint from './patch';

const router = Router();

router.patch('/secret', AuthJWT, BroadcasterOnly, StreamerDataPatchEndpoint.updateSecret);

export default router;
