import Dto from '@db/dto/dto';
import { IStreamerConfiguration } from '@common/db/schema/streamer-configuration';
import BanlistDto, { BanlistJSONStructure } from './banlist-dto';

interface StreamerConfigurationJSONStructure {
  version: string;

  chatIntegration: {
    enabled: boolean;
    channelName: string;
  };

  requests: {
    perUser: number;
    duplicates: boolean;
  };

  banlist: {
    active: BanlistJSONStructure;
    banlists: BanlistJSONStructure[];
  };
}

const StreamerConfigurationDto: Dto<IStreamerConfiguration, StreamerConfigurationJSONStructure> = {
  getJSON: (data: IStreamerConfiguration) => {
    return {
      version: data.version,
      chatIntegration: data.chatIntegration,
      requests: data.requests,
      banlist: {
        active: BanlistDto.getJSON(data.banlist.active),
        banlists: data.banlist.banlists.map(BanlistDto.getJSON),
      },
    };
  },
};

export default StreamerConfigurationDto;
