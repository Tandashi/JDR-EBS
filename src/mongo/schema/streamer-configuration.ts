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
  songRequest: ISongRequestCommandConfiguration;
  queue: IQueueCommandConfiguration;
  queuePosition: IQueuePositionCommandConfiguration;
  banlist: IBanlistCommandConfiguration;
}

export interface IChatIntegrationConfiguration {
  enabled: boolean;
  channelName: string;
  commands: IChatIntegrationCommandConfiguration;
}

export interface IRequestConfiguration {
  perUser: number;
  duplicates: boolean;
}

export interface IProfileConfiguration {
  active: ProfileDoc;
  profiles: ProfileDoc[];
}

export interface IStreamerConfiguration {
  version: 'v1.2';
  chatIntegration: IChatIntegrationConfiguration;
  requests: IRequestConfiguration;
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
