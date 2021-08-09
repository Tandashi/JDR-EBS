import { Document, Schema, Model, model } from 'mongoose';
import { ProfileDoc } from './profile';

interface ChatIntegrationConfiguration {
  enabled: boolean;
  channelName: string;
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
    enum: ['v1.0'],
  },
  chatIntegration: {
    enabled: Boolean,
    channelName: String,
  },
  requests: {
    perUser: Number,
    duplicates: Boolean,
  },
  profile: {
    active: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
    },
    profiles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
      },
    ],
  },
});

const StreamerConfiguration: Model<StreamerConfigurationDoc> = model<StreamerConfigurationDoc>(
  'StreamerConfiguration',
  streamerConfigurationSchema
);
export default StreamerConfiguration;
