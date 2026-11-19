export default class CancelToken {
  public cancelled = false;
  public onCancel?: () => void;
  public cancel() {
    this.cancelled = true;
    //eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.onCancel && this.onCancel();
  }
}
