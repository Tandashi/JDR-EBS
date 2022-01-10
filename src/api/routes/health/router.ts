import { Router } from 'express';

import HealthGetEndpoint from './get';

const router = Router();

router.use('/', HealthGetEndpoint.get);

export default router;
