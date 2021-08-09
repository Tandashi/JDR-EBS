import Dto from '@db/dto/dto';
import { IStreamerConfiguration } from '@common/db/schema/streamer-configuration';
import ProfileDto, { ProfileJSONStructure } from './profile-dto';

export interface StreamerConfigurationJSONStructure {
  version: string;

  chatIntegration: {
    enabled: boolean;
    channelName: string;
  };

  requests: {
    perUser: number;
    duplicates: boolean;
  };

  profile: {
    active: ProfileJSONStructure;
    profiles: ProfileJSONStructure[];
  };
}

const StreamerConfigurationDto: Dto<IStreamerConfiguration, StreamerConfigurationJSONStructure> = {
  getJSON: (data: IStreamerConfiguration) => {
    return {
      version: data.version,
      chatIntegration: data.chatIntegration,
      requests: data.requests,
      profile: {
        active: ProfileDto.getJSON(data.profile.active),
        profiles: data.profile.profiles.map(ProfileDto.getJSON),
      },
    };
  },
};

export default StreamerConfigurationDto;
