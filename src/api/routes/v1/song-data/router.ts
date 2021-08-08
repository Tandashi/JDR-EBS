import { Router } from 'express';

import { AuthJWT } from '@api/middleware/auth';
import SongDataGetEndpoint, { getRequestValidationSchema } from './get';
import { checkValidation } from '@api/middleware/validation';
import { checkSchema } from 'express-validator';

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
