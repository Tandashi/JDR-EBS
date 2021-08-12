import express from 'express';
import { validationResult } from 'express-validator';

import ResponseService from '@services/response-service';

export const checkValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return ResponseService.sendBadRequest(
      res,
      errors
        .array()
        .map((v) => v.msg)
        .join(', ')
    );
  }

  next();
};
