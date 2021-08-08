import { Router } from 'express';

import songdataRouter from '@api/routes/v1/song-data/router';
import queueRouter from '@api/routes/v1/queue/router';
import configurationRouter from '@api/routes/v1/configuration/router';
import profileRouter from '@api/routes/v1/profile/router';

const router = Router();

router.use('/songdata', songdataRouter);
router.use('/queue', queueRouter);
router.use('/configuration', configurationRouter);
router.use('/profile', profileRouter);

export default router;
