import { BugReport } from "../entity/BugReport";
import { jiraAdapter } from "../adapter/JiraAdapter";
import {
  CreateJiraIssueResponse,
  JiraIssuePriority,
  JiraIssueType,
} from "../dto/JiraIssue";
import { User } from "../entity/User";
import { AppDataSource } from "../AppDataSource";
import { openaiAdapter, OpenAIAdapter } from "../adapter/OpenAIAdapter";
import { Repository } from "typeorm";

const slackToJiraPriority: Record<string, JiraIssuePriority> = {
  "low - not performing as expected, no gpu impact": JiraIssuePriority.Low,
  ":large_blue_circle: not urgent": JiraIssuePriority.Low,
  "med - customer friction with minimal gpu or deal impact":
    JiraIssuePriority.Medium,
  ":smiling_face_with_tear: should fix soon": JiraIssuePriority.Medium,
  "high - may cause a deal to fall through": JiraIssuePriority.High,
  ":large_yellow_circle: urgent, but there is a work around right now":
    JiraIssuePriority.High,
  "urgent - will cause a deal to fall through": JiraIssuePriority.Highest,
  ":red_circle: very urgent, no work around possible":
    JiraIssuePriority.Highest,
};

export class JiraService {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly bugReportRepository: Repository<BugReport>,
    private readonly openaiAdapter: OpenAIAdapter
  ) {}

  async createBugReport(
    bugReport: BugReport,
    assignee: User
  ): Promise<CreateJiraIssueResponse> {
    if (!assignee.jiraAccountId) {
      if (!assignee.email) {
        throw new Error("The user must have an email to create a Jira issue");
      }
      assignee.jiraAccountId = await jiraAdapter.getAccountId(assignee.email);
      await this.userRepository.save(assignee);
    }

    const issue = await jiraAdapter.createIssue(
      bugReport.request,
      "To help the team better understand and resolve the issue, please provide a brief description using the template below:\n\n" +
        "h2. Symptom\n" +
        "- What specific behavior or error are you observing?\n" +
        "- When did it start occurring? (date/time if known)\n" +
        "- How frequently does it happen? (e.g., every time, intermittent)\n\n" +
        "h2. Root Cause\n" +
        "- What do you think is causing this issue?\n" +
        "- Which specific components or services are affected?\n" +
        "- Include any relevant error messages, logs, or stack traces\n\n" +
        "h2. Triage, Reproduction Result and Resolution\n" +
        "- What steps have you taken to investigate?\n" +
        "- How did you resolve this issue? (or current workaround if still investigating)\n" +
        "- Are there any related issues or dependencies?\n\n" +
        "h2. Additional Information (optional)\n" +
        "- PR Link (if fix is ready): \n" +
        "- Relevant screenshots or logs: \n" +
        "- Business Impact: (e.g., number of affected users/customers)\n",
      JiraIssueType.Bug,
      assignee.jiraAccountId,
      slackToJiraPriority[bugReport.urgency.toLowerCase()],
      assignee.jiraAccountId,
      ["SlackBugReport", ...bugReport.categories]
    );

    await jiraAdapter.attachRemoteLink(
      issue.key,
      bugReport.permalink,
      "Slack Bug Report"
    );

    await this.bugReportRepository.update(bugReport.id, {
      jiraIssueKey: issue.key,
    });

    return issue;
  }

  async addCommentToJiraIssue(jiraIssueKey: string, comment: string) {
    await jiraAdapter.addComment(jiraIssueKey, comment);
  }
}
export const jiraService = new JiraService(
  AppDataSource.getRepository(User),
  AppDataSource.getRepository(BugReport),
  openaiAdapter
);
