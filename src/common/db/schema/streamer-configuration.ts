import { Document, Schema, Model, model } from 'mongoose';
import { BanlistDoc } from './banlist';

interface ChatIntegrationConfiguration {
  enabled: boolean;
  channelName: string;
}

interface RequestConfiguration {
  perUser: number;
  duplicates: boolean;
}

interface BanlistConfiguration {
  active: BanlistDoc;
  banlists: BanlistDoc[];
}

interface SongConfiguration {
  unlimited: boolean;
}

export interface IStreamerConfiguration {
  version: string;
  chatIntegration: ChatIntegrationConfiguration;
  requests: RequestConfiguration;
  banlist: BanlistConfiguration;
  song: SongConfiguration;
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
  banlist: {
    active: {
      type: Schema.Types.ObjectId,
      ref: 'Banlist',
    },
    banlists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Banlist',
      },
    ],
  },
  song: {
    unlimited: Boolean,
  },
});

const StreamerConfiguration: Model<StreamerConfigurationDoc> = model<StreamerConfigurationDoc>(
  'StreamerConfiguration',
  streamerConfigurationSchema
);
export default StreamerConfiguration;
