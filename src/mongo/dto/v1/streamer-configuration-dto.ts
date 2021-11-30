import Dto from '@mongo/dto/dto';
import { IStreamerConfiguration } from '@mongo/schema/streamer-configuration';
import ProfileDto, { ProfileJSONStructure } from '@mongo/dto/v1/profile-dto';

export interface StreamerConfigurationJSONStructure {
  version: string;

  chatIntegration: {
    enabled: boolean;
    channelName: string;
    announcements: {
      queue: {
        status: {
          opened: boolean;
          closed: boolean;
          cleared: boolean;
        };
        song: {
          fromChat: boolean;
          fromExtension: boolean;
          nextUp: boolean;
        };
      };
    };
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
        announcements: {
          queue: {
            status: {
              opened: data.chatIntegration.announcements.queue.status.closed,
              closed: data.chatIntegration.announcements.queue.status.opened,
              cleared: data.chatIntegration.announcements.queue.status.cleared,
            },
            song: {
              fromChat: data.chatIntegration.announcements.queue.song.fromChat,
              fromExtension: data.chatIntegration.announcements.queue.song.fromExtension,
              nextUp: data.chatIntegration.announcements.queue.song.nextUp,
            },
          },
        },
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
