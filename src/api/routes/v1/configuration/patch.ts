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
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `theme` must be an object',
      bail: true,
    },
  },
  'theme.liveConfig': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `theme.liveConfig` must be an object',
      bail: true,
    },
  },
  'theme.liveConfig.css': {
    in: 'body',
    optional: { options: { nullable: true } },
    isString: {
      errorMessage: 'Field `theme.liveConfig.css` must be a string',
      bail: true,
    },
  },
  chatIntegration: {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration` must be an object',
      bail: true,
    },
  },
  'chatIntegration.enabled': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.enabled` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.announcements` must be an object',
      bail: true,
    },
  },
  'chatIntegration.announcements.queue': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.announcements.queue` must be an object',
      bail: true,
    },
  },
  'chatIntegration.announcements.queue.status': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.announcements.queue.status` must be an object',
      bail: true,
    },
  },
  'chatIntegration.announcements.queue.status.opened': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.status.opened` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.status.closed': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.status.closed` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.status.cleared': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.status.cleared` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.song': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.announcements.queue.song` must be an object',
      bail: true,
    },
  },
  'chatIntegration.announcements.queue.song.fromChat': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.song.fromChat` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.song.fromExtension': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.song.fromExtension` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.announcements.queue.song.nextUp': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.announcements.queue.song.nextUp` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.commands': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.songRequest': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.songRequest` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.songRequest.enabled': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.songRequest.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.queue': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.queue` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.queue.enabled': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.queue.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.queuePosition': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.queuePosition` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.queuePosition.enabled': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.queuePosition.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.leave': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.leave` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.leave.enabled': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.leave.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist': {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.banlist` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist.enabled': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.banlist.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist.format': {
    in: 'body',
    optional: { options: { nullable: true } },
    isString: {
      errorMessage: 'Field `chatIntegration.commands.banlist.format` must be a string',
      bail: true,
    },
  },
  requests: {
    in: 'body',
    optional: { options: { nullable: true } },
    isObject: {
      errorMessage: 'Field `requests` must be an object',
      bail: true,
    },
  },
  'requests.perUser': {
    in: 'body',
    optional: { options: { nullable: true } },
    isInt: {
      errorMessage: 'Field `requests.perUser` must be a number',
      bail: true,
    },
    toInt: true,
  },
  'requests.duplicates': {
    in: 'body',
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'Field `requests.duplicates` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
};

export default class StreamerConfigurationPatchEndpoint {
  public static async update(req: express.Request, res: express.Response): Promise<void> {
    // Grab the current configuration of the channel
    const configurationResult = await StreamerConfigurationDao.get(req.user.channel_id);
    // Check if errors occured
    if (configurationResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_STREAMER_CONFIGURATION);
    }

    // Get the configuration data
    let configuration = configurationResult.data;
    // Check if the channel name is set. If not we just set it.
    if (!configuration.chatIntegration.channelName) {
      const configurationResult = await StreamerConfigurationService.updateChannelName(
        configuration._id,
        req.user.channel_id
      );
      // Check if an error occured during the channel name update
      if (configurationResult.type === 'error') {
        return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_CHANNEL_NAME);
      }
      // Set the configuration to the freshly updated one so
      // we don't work with outdated data
      configuration = configurationResult.data;
    }

    // Update the channel configuration using the HTTP Request
    const updateResult = await StreamerConfigurationService.update(configuration, req);
    // Check if updating caused an error
    if (updateResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_CHANNEL_NAME);
    }

    APIResponseService.sendOk(res, { data: StreamerConfigurationDto.getJSON(updateResult.data) });
  }
}
