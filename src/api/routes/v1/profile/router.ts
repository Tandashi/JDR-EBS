import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { checkValidation } from '@api/middleware/validation';
import { AuthJWT, BroadcasterOnly } from '@api/middleware/auth';

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
