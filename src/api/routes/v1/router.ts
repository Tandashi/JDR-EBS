import { Router } from 'express';

import songdataRouter from '@api/routes/v1/songdata/router';
import queueRouter from '@api/routes/v1/queue/router';

const router = Router();

router.use('/songdata', songdataRouter);
router.use('/queue', queueRouter);

export default router;
