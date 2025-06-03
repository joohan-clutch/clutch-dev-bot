import { bugReportService } from "../service/BugReportService";
import { jiraService } from "../service/JiraService";
import { onCallService } from "../service/OnCallService";
import { getDatesInRange } from "../util/TimeUtil";

export class BugReportUseCase {
  async receiveNewBugReport(
    channelId: string,
    channelName: string,
    messageId: string,
    text: string,
  ): Promise<void> {
    // Slack sometimes send the same message multiple times. If we have received the same message before, we skip it.
    const existingBugReport = await bugReportService.getBugReport(
      channelId,
      messageId,
    );

    if (existingBugReport) {
      return;
    }

    const currentOnCallUser = await onCallService.getCurrentOnCallUser();

    const bugReport = await bugReportService.createBugReport(
      channelId,
      messageId,
      currentOnCallUser.slackId ?? "No on call user slack id",
      text,
    );

    const jiraIssue = await jiraService.createBugReport(
      bugReport,
      currentOnCallUser,
    );

    const jiraIssueLink = `${process.env.ATLASSIAN_BASE_URL}/browse/${jiraIssue.key}`;

    const primaryOnCallUser = await onCallService.getCurrentOnCallUser();
    const secondaryOnCallUsers =
      await onCallService.getCurrentSecondaryOnCallUsers();

    const userSlackIds = [
      primaryOnCallUser.slackId,
      ...(secondaryOnCallUsers.map((user) => user.slackId) || []),
    ];

    await onCallService.notifyOnCallUser(
      channelId,
      messageId,
      userSlackIds,
      `There is a new bug report in #${channelName}\n${bugReport.permalink}\n Jira issue: ${jiraIssueLink}`,
      `${userSlackIds.map((userSlackId) => `<@${userSlackId}>`).join(", ")} is on call for bug reporting. Created Jira issue: ${jiraIssueLink}`,
    );

    const relatedBugReports =
      await bugReportService.searchSimilarBugReport(bugReport);
    await jiraService.addCommentToJiraIssue(
      jiraIssue.key,
      `Note: This is an AI-generated analysis that may not be fully accurate due to limited data, but might be worth reviewing:\n\n${relatedBugReports}`,
    );
  }

  async addSlackRepliesToBugReport(
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const bugReports = await bugReportService.getBugReportsByDates(
      startDate,
      endDate,
    );

    for (const bugReport of bugReports) {
      await bugReportService.updateSlackReplies(bugReport);
      await bugReportService.updateBugReportWithPermalink(bugReport);
    }
  }
  async storeBugReportsInVectorStore(
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const bugReports = await bugReportService.getBugReportsByDates(
      startDate,
      endDate,
    );

    for (const date of getDatesInRange(startDate, endDate)) {
      await bugReportService.storeBugReportsInVectorStore(
        bugReports.filter((bugReport) => {
          return bugReport.createdAt.toDateString() === date.toDateString();
        }),
        date,
      );
    }
  }

  async commentTicketWithRelatedBugReport(bugReportId: number) {
    const bugReport = await bugReportService.getBugReportById(bugReportId);
    const relatedBugReports =
      await bugReportService.searchSimilarBugReport(bugReport);
    await jiraService.addCommentToJiraIssue(
      bugReport.jiraIssueKey,
      `Note: This is an AI-generated analysis that may not be fully accurate due to limited data, but might be worth reviewing:\n\n${relatedBugReports}`,
    );
  }
}

export const bugReportUseCase = new BugReportUseCase();
