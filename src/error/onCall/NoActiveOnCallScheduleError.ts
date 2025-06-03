import { BaseError } from "../BaseError";

export class NoActiveOnCallScheduleError extends BaseError {
  constructor(message: string = "No active on-call schedule found") {
    super(message);
  }
}
