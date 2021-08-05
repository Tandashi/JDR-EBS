import Dto from '@db/dto/dto';
import { IStreamerConfiguration } from '@common/db/schema/streamer-configuration';

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
}

const StreamerConfigurationDto: Dto<IStreamerConfiguration, StreamerConfigurationJSONStructure> = {
  getJSON: (data: IStreamerConfiguration) => {
    return {
      version: data.version,
      chatIntegration: data.chatIntegration,
      requests: data.requests,
    };
  },
};

export default StreamerConfigurationDto;
