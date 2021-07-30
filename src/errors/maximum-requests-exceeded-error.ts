export default class MaximumRequestsExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MaxiumumRequestsExceededError';
  }
}
