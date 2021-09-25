import { Document, Schema, Model, model } from 'mongoose';

import { QueueDoc } from '@mongo/schema/queue';
import { StreamerConfigurationDoc } from '@mongo/schema/streamer-configuration';

export interface IStreamerData {
  /**
   * The id of the channel.
   */
  channelId: string;
  /**
   * The secret to authenticate with besides JWT.
   */
  secret: string;
  /**
   * The {@link StreamerConfigurationDoc Configuration} of the Extension for that channel.
   */
  configuration: StreamerConfigurationDoc;
  /**
   * The {@link QueueDoc Queue} for the channel.
   */
  queue: QueueDoc;
}

export type StreamerDataDoc = IStreamerData & Document;

const streamerDataSchema: Schema = new Schema({
  channelId: {
    type: String,
    unique: true,
    required: true,
  },
  secret: {
    type: String,
    unique: true,
    required: true,
  },
  configuration: {
    type: Schema.Types.ObjectId,
    ref: 'StreamerConfiguration',
    required: true,
  },
  queue: {
    type: Schema.Types.ObjectId,
    ref: 'Queue',
    required: true,
  },
});

const StreamerData: Model<StreamerDataDoc> = model<StreamerDataDoc>('StreamerData', streamerDataSchema);
export default StreamerData;
