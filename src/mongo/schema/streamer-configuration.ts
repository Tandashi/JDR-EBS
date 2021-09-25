import { Document, Schema, Model, model } from 'mongoose';

import { ProfileDoc } from '@mongo/schema/profile';

interface IToggleableCommandConfiguration {
  enabled: boolean;
}

export interface ISongRequestCommandConfiguration extends IToggleableCommandConfiguration {}
export interface IQueueCommandConfiguration extends IToggleableCommandConfiguration {}
export interface IQueuePositionCommandConfiguration extends IToggleableCommandConfiguration {}

export interface IBanlistCommandConfiguration extends IToggleableCommandConfiguration {
  format: string;
}

export interface IChatIntegrationCommandConfiguration {
  /**
   * The Configuration regarding the SongRequests Command.
   */
  songRequest: ISongRequestCommandConfiguration;
  /**
   * The Configuration regarding the Queue Command.
   */
  queue: IQueueCommandConfiguration;
  /**
   * The Configuration regarding the QueuePosition Command.
   */
  queuePosition: IQueuePositionCommandConfiguration;
  /**
   * The Configuration regarding the Banlist Command.
   */
  banlist: IBanlistCommandConfiguration;
}

export interface IChatIntegrationConfiguration {
  /**
   * If the ChatIntegration is enabled.
   */
  enabled: boolean;
  /**
   * The channel name of the Streamer.
   */
  channelName: string;
  /**
   * The Comamnd Configurations.
   */
  commands: IChatIntegrationCommandConfiguration;
}

export interface IRequestConfiguration {
  /**
   * The number of Song Requests a User can have siultaniously in the Queue.
   */
  perUser: number;
  /**
   * If the same Song can exist multiple times in the Queue.
   */
  duplicates: boolean;
}

export interface IProfileConfiguration {
  /**
   * The current active {@link ProfileDoc Profile}.
   */
  active: ProfileDoc;
  /**
   * A List of {@link ProfileDoc Profiles} a user has.
   */
  profiles: ProfileDoc[];
}

export interface IStreamerConfiguration {
  /**
   * The version of the Configuration.
   */
  version: 'v1.2';
  /**
   * The ChatIntegration Configuration.
   */
  chatIntegration: IChatIntegrationConfiguration;
  /**
   * The Requests Configuration.
   */
  requests: IRequestConfiguration;
  /**
   * The {@link ProfileDoc Profile} Configuration.
   */
  profile: IProfileConfiguration;
}

export type StreamerConfigurationDoc = IStreamerConfiguration & Document;

const streamerConfigurationSchema: Schema = new Schema({
  version: {
    type: String,
    enum: ['v1.2'],
    required: true,
  },
  chatIntegration: {
    enabled: {
      type: Boolean,
      required: true,
    },
    channelName: {
      type: String,
      required: [
        function (): boolean {
          return this.chatIntegration.enabled;
        },
        'chatIntegration.channelName is required if chatIntegration.enabled is true.',
      ],
    },
    commands: {
      songRequest: {
        enabled: {
          type: Boolean,
          required: true,
        },
      },
      queue: {
        enabled: {
          type: Boolean,
          required: true,
        },
      },
      queuePosition: {
        enabled: {
          type: Boolean,
          required: true,
        },
      },
      banlist: {
        enabled: {
          type: Boolean,
          required: true,
        },
        format: {
          type: String,
          required: true,
        },
      },
    },
  },
  requests: {
    perUser: {
      type: Number,
      required: true,
    },
    duplicates: {
      type: Boolean,
      required: true,
    },
  },
  profile: {
    active: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    profiles: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Profile',
        },
      ],
      required: [
        function (): boolean {
          // Ensure that there is minimum one profile
          return this.profile.profiles.length > 0;
        },
        'At least on profile has to exist.',
      ],
    },
  },
});

const StreamerConfiguration: Model<StreamerConfigurationDoc> = model<StreamerConfigurationDoc>(
  'StreamerConfiguration',
  streamerConfigurationSchema
);
export default StreamerConfiguration;
