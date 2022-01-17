import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { AuthJWT } from '@web/middleware/auth';
import { checkValidation } from '@web/middleware/validation';

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
