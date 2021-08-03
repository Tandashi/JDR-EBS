import { Document, Schema, Model, model } from 'mongoose';

import { IQueue } from '@db/schema/queue';

export interface IStreamerData extends Document {
  channelId: string;
  queue: IQueue;
}

const streamerDataSchema: Schema = new Schema({
  channelId: {
    type: String,
    unique: true,
  },
  queue: {
    type: Schema.Types.ObjectId,
    ref: 'Queue',
  },
});

const StreamerData: Model<IStreamerData> = model<IStreamerData>('StreamerData', streamerDataSchema);
export default StreamerData;
