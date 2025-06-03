import axios from "axios";
import * as dotenv from "dotenv";
type DispatchActionInputs = {
  team: string;
};

export class GithubAdapter {
  private readonly githubToken: string;
  private readonly owner: string;
  private readonly repository: string;

  constructor(githubToken: string, owner: string, repository: string) {
    this.githubToken = githubToken;
    this.owner = owner;
    this.repository = repository;
  }

  async dispatchAction(workflowName: string, inputs: DispatchActionInputs) {
    const response = await axios.post(
      `https://api.github.com/repos/${this.owner}/${this.repository}/actions/workflows/${workflowName}/dispatches`,
      {
        ref: "main",
        inputs,
      },
      {
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    return response;
  }
}

dotenv.config();

if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is not set");
}

if (!process.env.GITHUB_OWNER) {
  throw new Error("GITHUB_OWNER is not set");
}

if (!process.env.GITHUB_REPOSITORY) {
  throw new Error("GITHUB_REPOSITORY is not set");
}

export const githubAdapter = new GithubAdapter(
  process.env.GITHUB_TOKEN,
  process.env.GITHUB_OWNER,
  process.env.GITHUB_REPOSITORY
);
