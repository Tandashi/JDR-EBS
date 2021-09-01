import config from '@common/config';

export default class URLService {
  public static getRedirectUrl(): string {
    const version = config.twitch.extension.version;
    if (version.isDev === true) {
      return `http://localhost:8080/live-configuration.html`;
    }

    return `https://${config.twitch.extension.clientId}.ext-twitch.tv/${config.twitch.extension.clientId}/${version.versionNumber}/${version.fileHash}/live-configuration.html`;
  }

  public static getImageUrl(imageName: string): string {
    return `${config.esb.publicAddress}/static/${config.esb.static.imageDir}/${imageName}`;
  }

  public static getVideoUrl(videoName: string): string {
    return `${config.esb.publicAddress}/static/${config.esb.static.videoDir}/${videoName}`;
  }
}
