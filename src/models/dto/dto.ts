export default abstract class DTO<D, R> {
  abstract getJSON(data: D): R;
}
