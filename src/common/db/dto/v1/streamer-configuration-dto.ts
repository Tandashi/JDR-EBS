import Dto from '@db/dto/dto';
import { IStreamerConfiguration } from '@db/schema/streamer-configuration';
import ProfileDto, { ProfileJSONStructure } from '@db/dto/v1/profile-dto';

export interface StreamerConfigurationJSONStructure {
  version: string;

  chatIntegration: {
    enabled: boolean;
    channelName: string;
    commands: {
      songRequest: {
        enabled: boolean;
      };
      banlist: {
        enabled: boolean;
        format: string;
      };
    };
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
      chatIntegration: {
        enabled: data.chatIntegration.enabled,
        channelName: data.chatIntegration.channelName,
        commands: {
          songRequest: {
            enabled: data.chatIntegration.commands.songRequest.enabled,
          },
          banlist: {
            enabled: data.chatIntegration.commands.banlist.enabled,
            format: data.chatIntegration.commands.banlist.format,
          },
        },
      },
      requests: {
        perUser: data.requests.perUser,
        duplicates: data.requests.duplicates,
      },
      profile: {
        active: ProfileDto.getJSON(data.profile.active),
        profiles: data.profile.profiles.map(ProfileDto.getJSON),
      },
    };
  },
};

export default StreamerConfigurationDto;
