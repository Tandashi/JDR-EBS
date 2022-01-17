import { Router } from 'express';

import v1Router from '@web/routes/api/v1/router';

const router = Router();

router.use('/v1', v1Router);

export default router;
