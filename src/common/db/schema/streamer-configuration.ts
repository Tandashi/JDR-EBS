import { Document, Schema, Model, model } from 'mongoose';

import { ProfileDoc } from '@db/schema/profile';

interface ChatIntegrationConfiguration {
  enabled: boolean;
  channelName: string;
  banlistFormat: string;
}

interface RequestConfiguration {
  perUser: number;
  duplicates: boolean;
}

interface ProfileConfiguration {
  active: ProfileDoc;
  profiles: ProfileDoc[];
}

export interface IStreamerConfiguration {
  version: string;
  chatIntegration: ChatIntegrationConfiguration;
  requests: RequestConfiguration;
  profile: ProfileConfiguration;
}

export type StreamerConfigurationDoc = IStreamerConfiguration & Document;

const streamerConfigurationSchema: Schema = new Schema({
  version: {
    type: String,
    enum: ['v1.1'],
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
    banlistFormat: {
      type: String,
      required: true,
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

const StreamerConfiguration: Model<StreamerConfigurationDoc> =
  model<StreamerConfigurationDoc>(
    'StreamerConfiguration',
    streamerConfigurationSchema
  );
export default StreamerConfiguration;
