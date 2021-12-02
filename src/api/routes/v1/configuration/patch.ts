import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import StreamerConfigurationService from '@services/streamer-configuration-service';

import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import StreamerConfigurationDto from '@mongo/dto/v1/streamer-configuration-dto';

const APIResponseService = ResponseService.getAPIInstance();

export const updateRequestValidationSchema: Schema = {
  theme: {
    in: 'body',
    isObject: {
      errorMessage: 'Field `theme` must be an object',
      bail: true,
    },
  },
  'theme.liveConfig': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `theme.liveConfig` must be an object',
      bail: true,
    },
  },
  'theme.liveConfig.css': {
    in: 'body',
    isString: {
      errorMessage: 'Field `theme.liveConfig.css` must be a string',
      bail: true,
    },
  },
  chatIntegration: {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration` must be an object',
      bail: true,
    },
  },
  'chatIntegration.enabled': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.enabled` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.announcements` must be an object',
      bail: true,
    },
  },
  'chatIntegration.announcements.queue': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.announcements.queue` must be an object',
      bail: true,
    },
  },
  'chatIntegration.announcements.queue.status': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.announcements.queue.status` must be an object',
      bail: true,
    },
  },
  'chatIntegration.announcements.queue.status.opened': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.status.opened` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.status.closed': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.status.closed` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.status.cleared': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.status.cleared` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.song': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.announcements.queue.song` must be an object',
      bail: true,
    },
  },
  'chatIntegration.announcements.queue.song.fromChat': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.song.fromChat` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.song.fromExtension': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.song.fromExtension` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.song.nextUp': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.song.nextUp` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.commands': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.commands` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.songRequest': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.songRequest` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.songRequest.enabled': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.songRequest.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.queue': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.queue` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.queue.enabled': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.queue.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.queuePosition': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.queuePosition` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.queuePosition.enabled': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.queuePosition.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.banlist` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist.enabled': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.banlist.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist.format': {
    in: 'body',
    isString: {
      errorMessage: 'Field `chatIntegration.commands.banlist.format` must be a string',
      bail: true,
    },
  },
  requests: {
    in: 'body',
    isObject: {
      errorMessage: 'Field `requests` must be an object',
      bail: true,
    },
  },
  'requests.perUser': {
    in: 'body',
    isInt: {
      errorMessage: 'Field `requests.perUser` must be a number',
      bail: true,
    },
    toInt: true,
  },
  'requests.duplicates': {
    in: 'body',
    isBoolean: {
      errorMessage: 'Field `requests.duplicates` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
};

export default class StreamerConfigurationPatchEndpoint {
  public static async update(req: express.Request, res: express.Response): Promise<void> {
    const configurationResult = await StreamerConfigurationDao.get(req.user.channel_id);
    if (configurationResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_STREAMER_CONFIGURATION);
    }

    let configuration = configurationResult.data;
    if (!configuration.chatIntegration.channelName) {
      const configurationResult = await StreamerConfigurationService.updateChannelName(
        configuration._id,
        req.user.channel_id
      );

      if (configurationResult.type === 'error') {
        return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_CHANNEL_NAME);
      }

      configuration = configurationResult.data;
    }

    const updateResult = await StreamerConfigurationService.update(configuration, req);
    if (updateResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_CHANNEL_NAME);
    }

    configuration = updateResult.data;
    APIResponseService.sendOk(res, { data: StreamerConfigurationDto.getJSON(configuration) });
  }
}
