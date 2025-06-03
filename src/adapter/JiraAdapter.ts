import axios, { AxiosError } from "axios";
import {
  CreateJiraIssueRequest,
  CreateJiraIssueResponse,
  JiraIssuePriority,
  JiraIssueType,
} from "../dto/JiraIssue";

import * as dotenv from "dotenv";
import { JiraUser } from "../dto/JiraUser";

dotenv.config();

export class JiraAdapter {
  private readonly baseUrl: string;
  private readonly auth: { username: string; password: string };
  private readonly projectKey: string;
  constructor(
    baseUrl: string,
    username: string,
    apiToken: string,
    projectKey: string
  ) {
    this.baseUrl = baseUrl;
    this.auth = {
      username: username,
      password: apiToken,
    };
    this.projectKey = projectKey;
  }

  async createIssue(
    summary: string,
    description: string,
    issueType: JiraIssueType,
    reporterAccountId: string,
    priority: JiraIssuePriority,
    assigneeAccountId: string,
    labels: string[]
  ): Promise<CreateJiraIssueResponse> {
    const summaryUnderMaxLength =
      summary.length > 100 ? `${summary.substring(0, 97)}...` : summary; // The max length of the summary is 255 characters. I am setting under 100 for visability
    const ticket: CreateJiraIssueRequest = {
      fields: {
        project: { key: this.projectKey },
        summary: summaryUnderMaxLength,
        description,
        issuetype: { name: issueType },
        priority: { name: priority },
        assignee: { accountId: assigneeAccountId },
        reporter: { accountId: reporterAccountId },
        labels: labels.map((label) => label.replace(/ /g, "_")),
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/rest/api/2/issue`,
        ticket,
        {
          auth: this.auth,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data as CreateJiraIssueResponse;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(
          `Failed to create Jira ticket: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error("Failed to create Jira ticket: Unknown error occurred");
    }
  }

  async attachRemoteLink(
    issueKey: string,
    url: string,
    title: string,
    description?: string
  ): Promise<void> {
    const payload = {
      object: {
        url: url,
        title: title,
        summary: description ?? title,
      },
    };

    try {
      await axios.post(
        `${this.baseUrl}/rest/api/2/issue/${issueKey}/remotelink`,
        payload,
        {
          auth: this.auth,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(
          `Failed to attach link to Jira ticket: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error(
        "Failed to attach link to Jira ticket: Unknown error occurred"
      );
    }
  }

  async deleteIssue(issueKey: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/rest/api/2/issue/${issueKey}`, {
        auth: this.auth,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(
          `Failed to delete Jira ticket: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error("Failed to delete Jira ticket: Unknown error occurred");
    }
  }

  async addComment(issueKey: string, comment: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/rest/api/2/issue/${issueKey}/comment`,
        { body: comment },
        {
          auth: this.auth,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(
          `Failed to add comment to Jira ticket to issue ${issueKey}: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error(
        "Failed to add comment to Jira ticket: Unknown error occurred"
      );
    }
  }

  async getAccountId(email: string): Promise<string> {
    const response = await axios.get(
      `${this.baseUrl}/rest/api/2/user/search?query=${email}`,
      {
        auth: this.auth,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to find user: ${response.statusText}`);
    }

    const users: JiraUser[] = response.data;

    if (users.length === 0) {
      throw new Error(`No user found with email: ${email}`);
    }

    return users[0].accountId;
  }
}

export const jiraAdapter = new JiraAdapter(
  process.env.ATLASSIAN_BASE_URL as string,
  process.env.ATLASSIAN_USERNAME as string,
  process.env.ATLASSIAN_API_TOKEN as string,
  process.env.JIRA_PROJECT_KEY as string
);
