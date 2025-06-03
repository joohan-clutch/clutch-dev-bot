import { BaseError } from "../BaseError";

export class UserNotFoundError extends BaseError {
  constructor(message: string = "User is not found from on-call user list") {
    super(message);
  }
}
