import getLogger from '@common/logging';
import config from '@common/config';

const logger = getLogger('URL Service');

export default class URLService {
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

  public static getImageUrl(imageName: string): string {
    const imageUrl = `${config.esb.publicAddress}/static/${config.esb.static.imageDir}/${imageName}`;
    logger.debug(`Getting Image URL: ${imageUrl}`);
    return imageUrl;
  }

  public static getVideoUrl(videoName: string): string {
    const videoUrl = `${config.esb.publicAddress}/static/${config.esb.static.videoDir}/${videoName}`;
    logger.debug(`Getting Video URL: ${videoUrl}`);
    return videoUrl;
  }
}
