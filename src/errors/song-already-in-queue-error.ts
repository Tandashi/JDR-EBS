export default class SongAlreadyInQueueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SongAlreadyInQueueError';
  }
}
