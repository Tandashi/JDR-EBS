import { Router } from 'express';

import { AuthJWT } from '@api/middleware/auth';

import GamesGetEndpoint from './get';

const router = Router();

router.get('/', AuthJWT, GamesGetEndpoint.get);

export default router;
