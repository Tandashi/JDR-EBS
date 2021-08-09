import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { checkValidation } from '@api/middleware/validation';
import { AuthJWT, BroadcasterOnly } from '@api/middleware/auth';

import StreamerConfigurationGetEndpoint from './get';
import StreamerConfigurationPatchEndpoint, { updateRequestValidationSchema } from './patch';

const router = Router();

router.get('/', AuthJWT, BroadcasterOnly, StreamerConfigurationGetEndpoint.get);
router.patch(
  '/',
  AuthJWT,
  BroadcasterOnly,
  checkSchema(updateRequestValidationSchema),
  checkValidation,
  StreamerConfigurationPatchEndpoint.update
);

export default router;
