import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { checkValidation } from '@api/middleware/validation';
import { AuthJWT, BroadcasterOnly } from '@api/middleware/auth';

import BanlistPatchEndpoint, { updateRequestValidationSchema } from './patch';

const router = Router();

router.patch(
  '/',
  AuthJWT,
  BroadcasterOnly,
  checkSchema(updateRequestValidationSchema),
  checkValidation,
  BanlistPatchEndpoint.update
);

export default router;
