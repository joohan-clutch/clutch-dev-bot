export type JiraUser = {
  self: string; // URL of the user
  accountId: string; // e.g., "5b10a2844c20165700ede21g"
  accountType: string; // e.g., "atlassian"
  emailAddress: string; // e.g., "user@example.com"
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  displayName: string; // e.g., "John Doe"
  active: boolean; // whether the account is active
  timeZone?: string; // e.g., "America/New_York"
  locale?: string; // e.g., "en_US"
};
