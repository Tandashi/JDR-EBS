/**
 * Dto used to maintain versioning of the API.
 */
export default interface Dto<D, R> {
  /**
   * Get the the newly formated response data as JSON.
   *
   * @param data The data that should be transfered
   */
  getJSON(data: D): R;
}
