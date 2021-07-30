import { Router } from 'express';

import songdataRouter from '@routes/v1/songdata/router';
import queueRouter from '@routes/v1/queue/router';

const router = Router();

router.use('/songdata', songdataRouter);
router.use('/queue', queueRouter);

export default router;
