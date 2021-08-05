import { Document, Schema, Model, model } from 'mongoose';

export interface ChatIntegrationConfiguration {
  enabled: boolean;
  channelName: string;
}

export interface RequestConfiguration {
  perUser: number;
  duplicates: boolean;
}

export interface RawStreamerConfiguration {
  version: string;
  chatIntegration: ChatIntegrationConfiguration;
  requests: RequestConfiguration;
}

export type IStreamerConfiguration = Document & RawStreamerConfiguration;

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
});

const StreamerConfiguration: Model<IStreamerConfiguration> = model<IStreamerConfiguration>(
  'StreamerConfiguration',
  streamerConfigurationSchema
);
export default StreamerConfiguration;
