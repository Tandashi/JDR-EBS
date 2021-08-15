import config from '@common/config';

export default class URLService {
  public static getImageUrl(imageName: string): string {
    if (!imageName) return undefined;

    return `${config.app.publicAddress}/static/${config.app.static.imageDir}/${imageName}`;
  }

  public static getVideoUrl(videoName: string): string {
    if (!videoName) return undefined;

    return `${config.app.publicAddress}/static/${config.app.static.videoDir}/${videoName}`;
  }
}
