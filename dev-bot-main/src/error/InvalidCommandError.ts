import { BaseError } from "./BaseError";

export class InvalidCommandError extends BaseError {
  constructor(message: string = "Invalid command") {
    super(message);
  }
}
