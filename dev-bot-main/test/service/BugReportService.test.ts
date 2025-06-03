import { expect } from "chai";
import { bugReportService } from "../../src/service/BugReportService";
import { AppDataSource } from "../../src/AppDataSource";

describe("BugReportService", () => {
  before(async () => {
    await AppDataSource.initialize();
  });
  it("should create a bug report", async () => {
    const bugReport = await bugReportService.createBugReport(
      "TestChannelId",
      "TestMessageId",
      "TestOnCallUserSlackId",
      "New Bug Report\n\nFrom:\n<@U07AHB36G22>\n\nCategory:\nSTC Tasks&amp;Docs, STC, Lifecycle &amp; Recon &amp; Vehicle - Admin\n\nRequest:\nzxczczc\n\nUrgency:\n:large_blue_circle: Not urgent\n\nReproducing the Issue:\nxxxxx\n\nLink to Customer Profile:\nzx\n\nIs there a workaround:\n:x: No\n\nDetails and possible workaround:\n"
    );
    expect(bugReport.id).to.be.a("number");
    expect(bugReport.fromUserSlackId).to.equal("U07AHB36G22");
    expect(bugReport.categories).to.deep.equal([
      "STC Tasks&Docs",
      "STC",
      "Lifecycle & Recon & Vehicle - Admin",
    ]);
    expect(bugReport.request).to.equal("zxczczc");
    expect(bugReport.urgency).to.equal(":large_blue_circle: Not urgent");
    expect(bugReport.howToReproduce).to.equal("xxxxx");
    expect(bugReport.linkToCustomerProfile).to.equal("zx");
    expect(bugReport.details).to.equal("");
    expect(bugReport.isThereAWorkaround).to.equal(false);
    expect(bugReport.jiraIssueKey).to.equal(null);
    expect(bugReport.channelId).to.equal("TestChannelId");
    expect(bugReport.messageId).to.equal("TestMessageId");
    expect(bugReport.createdAt).to.be.a("Date");
  });
});
