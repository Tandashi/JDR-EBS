import config from '@common/config';

export default class URLService {
  private static getBaseUrl(): string {
    const port = config.app.port != 80 && config.app.port != 443 ? `:${config.app.port}` : '';

    return `${config.app.protocol}://${config.app.hostname}${port}`;
  }

  public static getImageUrl(imageName: string): string {
    return `${this.getBaseUrl()}/static/${config.app.static.imageDir}/${imageName}`;
  }

  public static getVideoUrl(videoName: string): string {
    return `${this.getBaseUrl()}/static/${config.app.static.videoDir}/${videoName}`;
  }
}
