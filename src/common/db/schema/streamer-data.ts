import { Document, Schema, Model, model } from 'mongoose';

import { IQueue } from '@db/schema/queue';
import { IStreamerConfiguration } from './streamer-configuration';

export interface IStreamerData extends Document {
  channelId: string;
  configuration: IStreamerConfiguration;
  queue: IQueue;
}

const streamerDataSchema: Schema = new Schema({
  channelId: {
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

const StreamerData: Model<IStreamerData> = model<IStreamerData>('StreamerData', streamerDataSchema);
export default StreamerData;
