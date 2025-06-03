export enum JiraIssueStatus {
  ToDo = "TO DO",
  InProgress = "IN PROGRESS",
  ReadyToDeploy = "READY TO DEPLOY",
  Done = "DONE",
}
export enum JiraIssuePriority {
  Highest = "Highest",
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export enum JiraIssueType {
  Bug = "Bug",
  Task = "Task",
  Story = "Story",
  Epic = "Epic",
  Subtask = "Sub-task",
}

export type CreateJiraIssueRequest = {
  fields: {
    project: { key: string };
    summary: string;
    description: string;
    issuetype: { name: JiraIssueType };
    reporter?: { accountId: string };
    priority: { name: JiraIssuePriority };
    labels: string[];
    assignee: { accountId: string };
  };
};

export type CreateJiraIssueResponse = {
  id: string;
  key: string;
  self: string;
};
