import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import StreamerConfigurationService from '@services/streamer-configuration-service';

import StreamerConfigurationDao from '@db/dao/streamer-configuration-dao';
import StreamerConfigurationDto from '@db/dto/v1/streamer-configuration-dto';

export const updateRequestValidationSchema: Schema = {
  chatIntegration: {
    in: 'body',
    exists: {
      errorMessage: 'Field `chatIntegration` can not be empty',
      bail: true,
    },
    isObject: {
      errorMessage: 'Field `chatIntegration` must be an object',
      bail: true,
    },
  },
  'chatIntegration.enabled': {
    in: 'body',
    exists: {
      errorMessage: 'Field `chatIntegration.enabled` can not be empty',
      bail: true,
    },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.enabled` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
  'chatIntegration.commands': {
    in: 'body',
    exists: {
      errorMessage: 'Field `chatIntegration.commands` can not be empty',
      bail: true,
    },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.songRequest': {
    in: 'body',
    exists: {
      errorMessage: 'Field `chatIntegration.commands.songRequest` can not be empty',
      bail: true,
    },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.songRequest` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.songRequest.enabled': {
    in: 'body',
    exists: {
      errorMessage: 'Field `chatIntegration.commands.songRequest.enabled` can not be empty',
      bail: true,
    },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.songRequest.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist': {
    in: 'body',
    exists: {
      errorMessage: 'Field `chatIntegration.commands.banlist` can not be empty',
      bail: true,
    },
    isObject: {
      errorMessage: 'Field `chatIntegration.commands.banlist` must be an object',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist.enabled': {
    in: 'body',
    exists: {
      errorMessage: 'Field `chatIntegration.commands.banlist.enabled` can not be empty',
      bail: true,
    },
    isBoolean: {
      errorMessage: 'Field `chatIntegration.commands.banlist.enabled` must be a boolean',
      bail: true,
    },
  },
  'chatIntegration.commands.banlist.format': {
    in: 'body',
    exists: {
      errorMessage: 'Field `chatIntegration.commands.banlist.format` can not be empty',
      bail: true,
    },
    isString: {
      errorMessage: 'Field `chatIntegration.commands.banlist.format` must be a string',
      bail: true,
    },
  },
  requests: {
    in: 'body',
    exists: {
      errorMessage: 'Field `requests` can not be empty',
      bail: true,
    },
    isObject: {
      errorMessage: 'Field `requests` must be an object',
      bail: true,
    },
  },
  'requests.perUser': {
    in: 'body',
    exists: {
      errorMessage: 'Field `requests.perUser` can not be empty',
      bail: true,
    },
    isInt: {
      errorMessage: 'Field `requests.perUser` must be a number',
      bail: true,
    },
    toInt: true,
  },
  'requests.duplicates': {
    in: 'body',
    exists: {
      errorMessage: 'Field `requests.duplicates` can not be empty',
      bail: true,
    },
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
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_STREAMER_CONFIGURATION);
    }

    let configuration = configurationResult.data;
    if (!configuration.chatIntegration.channelName) {
      const configurationResult = await StreamerConfigurationService.updateChannelName(
        configuration._id,
        req.user.channel_id
      );

      if (configurationResult.type === 'error') {
        return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_CHANNEL_NAME);
      }

      configuration = configurationResult.data;
    }

    const updateResult = await StreamerConfigurationService.update(configuration, req);
    if (updateResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_CHANNEL_NAME);
    }

    configuration = updateResult.data;
    ResponseService.sendOk(res, { data: StreamerConfigurationDto.getJSON(configuration) });
  }
}
