import { confluenceAdapter } from "../adapter/ConfluenceAdapter";
import { HTMLHandler } from "../util/HTMLHandler";

export type OnCallScheduleRow = {
  name: string;
  startDate: Date;
  endDate: Date;
};

export class ConfluenceService {
  async getOnCallSchedule(): Promise<OnCallScheduleRow[]> {
    const page = await confluenceAdapter.getConfluencePage(
      process.env.ONCALL_SCHEDULE_PAGE_ID as string
    );

    const tableData = HTMLHandler.extractTables(page.body.storage.value);

    if (tableData.length === 0) {
      console.error(
        "No on call schedule found from Confluence",
        page.body.storage.value,
        tableData
      );
      return [];
    }

    if (
      tableData[0].headers.length != 2 ||
      tableData[0].headers[0] != "Person" ||
      tableData[0].headers[1] != "Week Assigned"
    ) {
      console.error(
        "Invalid on call schedule found from Confluence",
        page.body.storage.value,
        JSON.stringify(tableData)
      );
      return [];
    }

    const onCallSchedule: OnCallScheduleRow[] = tableData[0].rows
      .filter((row) => row[0] && row[0] !== "" && row[1] && row[1] !== "")
      .map((row) => {
        const startDate = new Date(row[1].split("-")[0].trim());
        const endDate = new Date(row[1].split("-")[1].trim());
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return {
          name: row[0].trim(),
          startDate,
          endDate,
        };
      });

    return onCallSchedule;
  }
}
export const confluenceService = new ConfluenceService();
