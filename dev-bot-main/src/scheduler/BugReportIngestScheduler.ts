import cron from "node-cron";
import { contextSearchAdapter } from "../adapter/ContextSearchAdapter";

export class BugReportIngestScheduler {
  constructor() {
    // Task runs every day 10AM
    cron.schedule("0 10 * * *", this.refresh).start();
  }

  async refresh() {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      await contextSearchAdapter.ingestSlackToJson([yesterday, today]);
      await contextSearchAdapter.ingestJsonToVectorStore([yesterday, today]);
    } catch (error) {
      console.error(error);
    }
  }
}

export const bugReportIngestScheduler = new BugReportIngestScheduler();
