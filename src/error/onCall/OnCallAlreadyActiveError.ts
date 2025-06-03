import { BaseError } from "../BaseError";

export class OnCallAlreadyActiveError extends BaseError {
  constructor(message: string = "An on call is already active") {
    super(message);
  }
}
