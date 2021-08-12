import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { AuthJWTOrSecret, AuthJWT, AuthSecret } from '@api/middleware/auth';
import { checkValidation } from '@api/middleware/validation';

import QueueGetEndpoint from './get';
import QueuePostEndpoint, { addRequestValidationSchema } from './post';
import QueueDeleteEndpoint, { deleteRequestValidationSchema } from './delete';

const router = Router();

router.get('/', AuthJWTOrSecret, QueueGetEndpoint.get);
router.post('/', AuthJWT, checkSchema(addRequestValidationSchema), checkValidation, QueuePostEndpoint.add);
router.delete(
  '/',
  AuthJWTOrSecret,
  checkSchema(deleteRequestValidationSchema),
  checkValidation,
  QueueDeleteEndpoint.delete
);

export default router;
