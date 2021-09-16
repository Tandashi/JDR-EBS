import Dto from '@mongo/dto/dto';
import { IStreamerData } from '@mongo/schema/streamer-data';
import StreamerConfigurationDto, { StreamerConfigurationJSONStructure } from '@mongo/dto/v1/streamer-configuration-dto';
import QueueDto, { QueueJSONStructure } from '@mongo/dto/v1/queue-dto';

export interface StreamerDataJSONStructure {
  channelId: string;
  secret: string;
  configuration: StreamerConfigurationJSONStructure;
  queue: QueueJSONStructure;
}

const StreamerDataDto: Dto<IStreamerData, StreamerDataJSONStructure> = {
  getJSON: (data: IStreamerData) => {
    return {
      channelId: data.channelId,
      secret: data.secret,
      configuration: StreamerConfigurationDto.getJSON(data.configuration),
      queue: QueueDto.getJSON(data.queue),
    };
  },
};

export default StreamerDataDto;
