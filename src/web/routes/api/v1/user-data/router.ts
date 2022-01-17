import { Router } from 'express';

import { AuthJWT } from '@web/middleware/auth';

import UserDataGetEndpoint from './get';
import UserDataPatchEndpoint from './patch';

const router = Router();

router.get('/', AuthJWT, UserDataGetEndpoint.get);
router.patch('/', AuthJWT, UserDataPatchEndpoint.update);

export default router;
