export class BaseError extends Error {
  public data?: any;

  constructor(message: string = "Base error", data?: any) {
    super(message);
    this.name = "BaseError";
    this.data = data;
    // This line is needed to maintain proper stack traces
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}
