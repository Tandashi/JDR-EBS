export default interface DTO<D, R> {
  getJSON(data: D): R;
}
