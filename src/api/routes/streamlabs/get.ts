import express from 'express';
import QueryString from 'qs';

import URLService from '@common/services/url-service';

export default class StreamlabsGetEndpoint {
  public static integrationRedirect(req: express.Request, res: express.Response): void {
    const redirectUrl = URLService.getRedirectUrl();
    const queryString = QueryString.stringify(req.query);
    res.redirect(301, `${redirectUrl}?${queryString}`);
  }
}
