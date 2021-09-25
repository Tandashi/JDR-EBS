import type { IStaticConfig, IESBConfig, ITwitchExtensionConfig } from '@common/config';

import getLogger from '@common/logging';
import config from '@common/config';

const logger = getLogger('URL Service');

export default class URLService {
  /**
   * Get the Redirect URL for the LiveConfiguration page.
   *
   * Will return the develop URL if the configured extension version is a develop version.
   * Else will return the configured release version url.
   *
   * @see {@link ITwitchExtensionConfig}
   *
   * @returns The redirect URL
   */
  public static getRedirectUrl(): string {
    const version = config.twitch.extension.version;
    let redirectUrl;

    if (version.isDev === true) {
      redirectUrl = `http://localhost:8080/live-configuration.html`;
    } else {
      redirectUrl = `https://${config.twitch.extension.clientId}.ext-twitch.tv/${config.twitch.extension.clientId}/${version.versionNumber}/${version.fileHash}/live-configuration.html`;
    }

    logger.debug(`Getting Redirect URL: ${redirectUrl}`);
    return redirectUrl;
  }

  /**
   * Get the URL for the given image.
   * Uses the configured {@link IESBConfig.publicAddress public address} as well as the {@link IStaticConfig.imageDir static image directory} to generate the Image URL.
   *
   * @param imageName The name of the image the URL should be provided for
   *
   * @returns The URL for the image
   */
  public static getImageUrl(imageName: string): string {
    const imageUrl = `${config.esb.publicAddress}/static/${config.esb.static.imageDir}/${imageName}`;
    logger.debug(`Getting Image URL: ${imageUrl}`);
    return imageUrl;
  }

  /**
   * Get the URL for the given video.
   * Uses the configured {@link IESBConfig.publicAddress public address} as well as the {@link IStaticConfig.videoDir static video directory} to generate the Video URL.
   *
   * @param videoName The name of the video the URL should be provided for
   *
   * @returns The URL for the video
   */
  public static getVideoUrl(videoName: string): string {
    const videoUrl = `${config.esb.publicAddress}/static/${config.esb.static.videoDir}/${videoName}`;
    logger.debug(`Getting Video URL: ${videoUrl}`);
    return videoUrl;
  }
}
