import express from 'express';

import ResponseService from '@services/response-service';

export default class HealthGetEndpoint {
  public static get(_: express.Request, res: express.Response): void {
    ResponseService.getAPIInstance().sendOk(res, {
      data: {
        uptime: process.uptime().toFixed(0),
      },
    });
  }
}
