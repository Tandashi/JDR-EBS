export default interface Dto<D, R> {
  getJSON(data: D): R;
}
