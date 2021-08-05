import { ApiClient, HelixChannel } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

import config from '@common/config';
import logger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

export default class TwitchAPIService {
  private static instance: TwitchAPIService;
  private apiClient: ApiClient;

  private constructor() {
    const { clientId, clientSecret } = config.twitch.api;
    const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);

    this.apiClient = new ApiClient({ authProvider });
  }

  public static getInstance(): TwitchAPIService {
    if (!this.instance) {
      this.instance = new TwitchAPIService();
    }

    return this.instance;
  }

  public async getChannelInfo(channelId: string): Promise<Result<HelixChannel>> {
    try {
      const channelInfo = await this.apiClient.helix.channels.getChannelInfo(channelId);
      return Success(channelInfo);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not get channel information from Twitch API');
    }
  }
}
