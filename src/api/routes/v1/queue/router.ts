import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { AuthJWT, AuthSecret } from '@api/middleware/auth';
import { checkValidation } from '@api/middleware/validation';

import QueueGetEndpoint, { getRequestValidationSchema } from './get';
import QueuePostEndpoint, { addRequestValidationSchema } from './post';
import QueueDeleteEndpoint, { deleteRequestValidationSchema } from './delete';

const router = Router();

router.get('/:channelId', AuthJWT, checkSchema(getRequestValidationSchema), checkValidation, QueueGetEndpoint.get);
router.post('/', AuthJWT, checkSchema(addRequestValidationSchema), checkValidation, QueuePostEndpoint.add);
router.delete('/', AuthSecret, checkSchema(deleteRequestValidationSchema), checkValidation, QueueDeleteEndpoint.delete);

export default router;
