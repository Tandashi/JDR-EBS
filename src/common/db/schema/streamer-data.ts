import { Document, Schema, Model, model } from 'mongoose';

import { QueueDoc } from '@db/schema/queue';
import { StreamerConfigurationDoc } from '@db/schema/streamer-configuration';

export interface IStreamerData {
  channelId: string;
  secret: string;
  configuration: StreamerConfigurationDoc;
  queue: QueueDoc;
}

export type StreamerDataDoc = IStreamerData & Document;

const streamerDataSchema: Schema = new Schema({
  channelId: {
    type: String,
    unique: true,
  },
  secret: {
    type: String,
    unique: true,
  },
  configuration: {
    type: Schema.Types.ObjectId,
    ref: 'StreamerConfiguration',
  },
  queue: {
    type: Schema.Types.ObjectId,
    ref: 'Queue',
  },
});

const StreamerData: Model<StreamerDataDoc> = model<StreamerDataDoc>('StreamerData', streamerDataSchema);
export default StreamerData;
