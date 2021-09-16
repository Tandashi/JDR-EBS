import Dto from '@mongo/dto/dto';
import { IStreamerConfiguration } from '@mongo/schema/streamer-configuration';
import ProfileDto, { ProfileJSONStructure } from '@mongo/dto/v1/profile-dto';

export interface StreamerConfigurationJSONStructure {
  version: string;

  chatIntegration: {
    enabled: boolean;
    channelName: string;
    commands: {
      songRequest: {
        enabled: boolean;
      };
      queue: {
        enabled: boolean;
      };
      queuePosition: {
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
          queue: {
            enabled: data.chatIntegration.commands.queue.enabled,
          },
          queuePosition: {
            enabled: data.chatIntegration.commands.queuePosition.enabled,
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
