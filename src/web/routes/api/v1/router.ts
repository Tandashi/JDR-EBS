import { Router } from 'express';

import songDataRouter from '@web/routes/api/v1/song-data/router';
import queueRouter from '@web/routes/api/v1/queue/router';
import configurationRouter from '@web/routes/api/v1/configuration/router';
import profileRouter from '@web/routes/api/v1/profile/router';
import gamesRouter from '@web/routes/api/v1/games/router';
import streamerDataRouter from '@web/routes/api/v1/streamer-data/router';

const router = Router();

router.use('/songdata', songDataRouter);
router.use('/queue', queueRouter);
router.use('/configuration', configurationRouter);
router.use('/profile', profileRouter);
router.use('/games', gamesRouter);
router.use('/streamerdata', streamerDataRouter);

export default router;
