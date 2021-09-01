import { Router } from 'express';

import StreamlabsGetEndpoint from './get';

const router = Router();

router.use('/integration', StreamlabsGetEndpoint.integrationRedirect);

export default router;
