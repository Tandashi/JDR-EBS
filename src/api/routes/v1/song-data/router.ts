import { Router } from 'express';

import { AuthJWT } from '@api/middleware/auth';
import SongDataGetEndpoint from './get';

const router = Router();

router.get('/', SongDataGetEndpoint.getAll);
router.get('/filtered', AuthJWT, SongDataGetEndpoint.getFiltered);

export default router;
