import { Router } from 'express';
import songdataRouter from '@routes/v1/songdata/router';

const router = Router();

router.use('/songdata', songdataRouter);

export default router;
