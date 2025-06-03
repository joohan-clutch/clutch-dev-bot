import { BaseError } from "../BaseError";

export class NoPrimaryOnCallUserError extends BaseError {
  constructor(message: string = "No primary on-call user found") {
    super(message);
  }
}
