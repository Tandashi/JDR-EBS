import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { AuthJWTOrSecret, AuthJWT } from '@web/middleware/auth';
import { checkValidation } from '@web/middleware/validation';

import QueueGetEndpoint from './get';
import QueuePostEndpoint, { addRequestValidationSchema, announceRequestValidationSchema } from './post';
import QueuePatchEndpoint, { patchRequestValidationSchema } from './patch';
import QueueDeleteEndpoint, { deleteRequestValidationSchema } from './delete';

const router = Router();

router.get('/', AuthJWTOrSecret, QueueGetEndpoint.get);

router.post('/', AuthJWT, checkSchema(addRequestValidationSchema), checkValidation, QueuePostEndpoint.add);
router.post('/clear', AuthJWTOrSecret, QueuePostEndpoint.clear);
router.post(
  '/announce',
  AuthJWTOrSecret,
  checkSchema(announceRequestValidationSchema),
  checkValidation,
  QueuePostEndpoint.announce
);

router.patch(
  '/',
  AuthJWTOrSecret,
  checkSchema(patchRequestValidationSchema),
  checkValidation,
  QueuePatchEndpoint.setStatus
);

router.delete(
  '/',
  AuthJWTOrSecret,
  checkSchema(deleteRequestValidationSchema),
  checkValidation,
  QueueDeleteEndpoint.delete
);

export default router;
