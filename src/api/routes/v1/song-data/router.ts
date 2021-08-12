import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { AuthJWT } from '@api/middleware/auth';
import { checkValidation } from '@api/middleware/validation';

import SongDataGetEndpoint, { getRequestValidationSchema } from './get';

const router = Router();

router.get('/', SongDataGetEndpoint.getAll);
router.get(
  '/filtered',
  AuthJWT,
  checkSchema(getRequestValidationSchema),
  checkValidation,
  SongDataGetEndpoint.getFiltered
);

export default router;
