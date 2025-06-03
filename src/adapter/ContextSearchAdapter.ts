import axios from "axios";

// This is calling the API of the ContextSearch service running locally
export class ContextSearchAdapter {
  constructor(
    private readonly host: string,
    private readonly bugReportChannelId: string
  ) {}

  async search(
    query: string
  ): Promise<{ related_reports: string[]; analysis: string }> {
    const response = await axios.post(`${this.host}/search`, {
      version: "v1",
      query,
    });
    if (response.status != 200) {
      throw new Error("Failed to find the related bug reports");
    }
    return response.data;
  }

  async ingestSlackToJson(dates: Date[]) {
    console.log(`Sending request to ingest slack to json for dates: ${dates}`);
    const response = await axios.post(
      `${this.host}/ingest/slackToJson`,
      dates.map((date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return {
          date: `${year}-${month}-${day}`,
          channels: [this.bugReportChannelId],
        };
      })
    );

    return response;
  }

  async ingestJsonToVectorStore(dates: Date[]) {
    console.log(
      `Sending request to ingest json to vector store for dates: ${dates}`
    );
    const response = await axios.post(`${this.host}/ingest/jsonToVectorStore`, {
      dates: dates.map((date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }),
    });
    return response.data;
  }

  async status() {
    const response = await fetch(`${this.host}/status`);
    return response.json();
  }
}

export const contextSearchAdapter = new ContextSearchAdapter(
  process.env.CONTEXT_SEARCH_HOST || "http://localhost:5556",
  process.env.BUG_REPORT_CHANNEL_ID || "C07000000000000000"
);
