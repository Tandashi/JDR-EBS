import { Router } from 'express';

import { AuthJWT } from '@api/middleware/auth';
import StreamerConfigurationGetEndpoint from './get';
import StreamerConfigurationPatchEndpoint from './patch';

const router = Router();

router.get('/', AuthJWT, StreamerConfigurationGetEndpoint.get);
router.patch('/', AuthJWT, StreamerConfigurationPatchEndpoint.update);

export default router;
