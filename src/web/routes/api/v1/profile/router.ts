import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { checkValidation } from '@web/middleware/validation';
import { AuthJWT, BroadcasterOnly } from '@web/middleware/auth';

import ProfilePatchEndpoint, { updateRequestValidationSchema } from './patch';

const router = Router();

router.patch(
  '/',
  AuthJWT,
  BroadcasterOnly,
  checkSchema(updateRequestValidationSchema),
  checkValidation,
  ProfilePatchEndpoint.update
);

export default router;
