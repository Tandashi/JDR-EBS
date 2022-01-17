import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import getLogger from '@common/logging';

const logger = getLogger('Error Handler');
const APIResponseService = ResponseService.getAPIInstance();

export const logErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    next();
  } catch (e) {
    logger.error(e);
    APIResponseService.sendInternalError(res, ErrorResponseCode.INTERNAL_ERROR);
  }
};
