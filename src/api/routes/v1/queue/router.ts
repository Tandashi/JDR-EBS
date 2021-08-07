import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { AuthJWT } from '@api/middleware/auth';
import { checkValidation } from '@api/middleware/validation';

import QueueGetEndpoint, { getRequestValidationSchema } from './get';
import QueuePostEndpoint, { addRequestValidationSchema } from './post';

const router = Router();

router.get('/:channelId', AuthJWT, checkSchema(getRequestValidationSchema), checkValidation, QueueGetEndpoint.get);
router.post('/', AuthJWT, checkSchema(addRequestValidationSchema), checkValidation, QueuePostEndpoint.add);

export default router;
