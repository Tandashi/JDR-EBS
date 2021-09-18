import { ApiClient, HelixChannel } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

import getLogger from '@common/logging';
import config from '@common/config';
import { Result, Success, Failure } from '@common/result';

const logger = getLogger('Twitch API Service');

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

      if (!channelInfo) {
        throw new Error('Channel Information returned from Twitch API was null');
      }

      return Success(channelInfo);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not get channel information from Twitch API');
    }
  }
}
