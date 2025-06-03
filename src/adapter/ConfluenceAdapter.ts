import axios from "axios";
import { ConfluencePage } from "../dto/ConfluencePage";
import * as dotenv from "dotenv";
dotenv.config();

export class ConfluenceAdapter {
  private baseUrl: string;
  private auth: string;

  constructor(baseUrl: string, email: string, apiToken: string) {
    this.baseUrl = baseUrl;
    this.auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
  }

  async getConfluencePage(pageId: string): Promise<ConfluencePage> {
    try {
      const response = await axios.get<ConfluencePage>(
        `${this.baseUrl}/wiki/rest/api/content/${pageId}?expand=body.storage`,
        {
          headers: {
            Authorization: `Basic ${this.auth}`,
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching Confluence page:", error);
      throw error;
    }
  }
}

export const confluenceAdapter = new ConfluenceAdapter(
  process.env.ATLASSIAN_BASE_URL as string,
  process.env.ATLASSIAN_USERNAME as string,
  process.env.ATLASSIAN_API_TOKEN as string
);
