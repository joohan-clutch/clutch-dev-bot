import { jiraAdapter } from "../../src/adapter/JiraAdapter";
import { JiraIssuePriority } from "../../src/dto/JiraIssue";
import { JiraIssueStatus } from "../../src/dto/JiraIssue";
import { JiraIssueType } from "../../src/dto/JiraIssue";

describe("JiraAdapter", () => {
  it("should get account id", async () => {
    const accountId = await jiraAdapter.getAccountId("joohan.lee@clutch.ca");
    console.log("accountId", accountId);
  });

  it("should create a Jira ticket, attach a remote link, and delete the ticket", async () => {
    const accountId = await jiraAdapter.getAccountId("joohan.lee@clutch.ca");

    const ticketKey = await jiraAdapter.createIssue(
      "Test Ticket",
      "Test Description",
      JiraIssueType.Bug,
      accountId,
      JiraIssuePriority.Medium,
      accountId,
      ["SlackBugReport", "Tasks & Documents"]
    );
    console.log(JSON.stringify(ticketKey, null, 2));

    await jiraAdapter.attachRemoteLink(
      ticketKey.key,
      `https://slack.com/app_redirect?channel=C07AHB36G22&message_ts=1727466600.000000`,
      "Slack Bug Report"
    );

    await jiraAdapter.deleteIssue(ticketKey.key);
  });
});
