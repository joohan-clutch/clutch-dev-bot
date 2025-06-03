import { bugReportService } from "../../src/service/BugReportService";
import { AppDataSource } from "../../src/AppDataSource";
import { bugReportUseCase } from "../../src/use_case/BugReportUseCase";

describe("BugReportService", function (this: Mocha.Suite) {
  this.timeout(10000);
  let today: Date;
  before(async function () {
    this.timeout(10000);
    await AppDataSource.initialize();
    const testChannelId = process.env.TEST_CHANNEL_ID;
    const testMessageId = process.env.TEST_MESSAGE_ID;
    if (!testChannelId || !testMessageId) {
      throw new Error("TEST_CHANNEL_ID and TEST_MESSAGE_ID must be set");
    }
    const testOnCallUserSlackId =
      process.env.TEST_ON_CALL_USER_SLACK_ID || "TestOnCallUserSlackId";
    today = new Date();

    const bugReports = await bugReportService.getBugReportsByDates(
      today,
      today
    );
    if (bugReports.length === 0) {
      await bugReportService.createBugReport(
        testChannelId,
        testMessageId,
        testOnCallUserSlackId,
        "New Bug Report\n\nFrom:\n<@U07AHB36G22>\n\nCategory:\nSTC Tasks&amp;Docs, STC, Lifecycle &amp; Recon &amp; Vehicle - Admin\n\nRequest:\nzxczczc\n\nUrgency:\n:large_blue_circle: Not urgent\n\nReproducing the Issue:\nxxxxx\n\nLink to Customer Profile:\nzx\n\nIs there a workaround:\n:x: No\n\nDetails and possible workaround:\n"
      );
    }
  });
  it("should add slack replies to bug report", async () => {
    await bugReportUseCase.addSlackRepliesToBugReport(today, today);
  });
  it("should upload bug report to openai", async function () {
    await bugReportUseCase.storeBugReportsInVectorStore(today, today);
  });
});
