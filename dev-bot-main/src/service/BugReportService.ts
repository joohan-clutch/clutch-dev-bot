import { Between } from "typeorm";
import { AppDataSource } from "../AppDataSource";
import { BugReport } from "../entity/BugReport";
import { slackClient, SlackClient } from "../SlackClient";
import { openaiAdapter, OpenAIAdapter } from "../adapter/OpenAIAdapter";
import { Repository } from "typeorm/repository/Repository";

export class BugReportService {
  private readonly bugReportRepository: Repository<BugReport>;
  private readonly slackClient: SlackClient;
  private readonly openaiAdapter: OpenAIAdapter;
  constructor(slackClient: SlackClient) {
    this.slackClient = slackClient;
    this.bugReportRepository = AppDataSource.getRepository(BugReport);
    this.openaiAdapter = openaiAdapter;
  }

  async getBugReportById(id: number): Promise<BugReport> {
    const bugReport = await this.bugReportRepository.findOneBy({ id });
    if (!bugReport) {
      throw new Error(`The bug report (id: ${id}) is not found.`);
    }
    return bugReport;
  }

  async getBugReport(
    channelId: string,
    messageId: string,
  ): Promise<BugReport | null> {
    return this.bugReportRepository.findOneBy({ channelId, messageId });
  }

  async createBugReport(
    channelId: string,
    messageId: string,
    currentOnCallUserSlackId: string,
    text: string,
  ): Promise<BugReport> {
    const permalink = await slackClient.getPermalink(channelId, messageId);
    const bugReport = new BugReport(
      channelId,
      messageId,
      currentOnCallUserSlackId,
      text,
      permalink,
    );

    return this.bugReportRepository.save(bugReport);
  }

  async getBugReportsByDates(
    startDate: Date,
    endDate: Date,
  ): Promise<BugReport[]> {
    const startOfDay = new Date(startDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(endDate.setHours(23, 59, 59, 999));

    return this.bugReportRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });
  }

  async updateSlackReplies(bugReport: BugReport): Promise<BugReport> {
    const replies = await this.slackClient.getThreadReplies(
      bugReport.channelId,
      bugReport.messageId,
    );
    bugReport.replies = replies
      ?.filter(
        (reply) => reply.bot_id == null && reply.subtype !== "bot_message", //Exclude workflow messages and dev bot replies
      )
      .map((reply) => {
        return {
          message: reply.text.replace(/<@[A-Za-z0-9]+>/g, "<slack-user-id>"),
        };
      });

    return this.bugReportRepository.save(bugReport);
  }

  async updateBugReportWithPermalink(bugReport: BugReport): Promise<BugReport> {
    bugReport.permalink = await this.slackClient.getPermalink(
      bugReport.channelId,
      bugReport.messageId,
    );
    return this.bugReportRepository.save(bugReport);
  }

  async storeBugReportsInVectorStore(
    bugReports: BugReport[],
    date: Date,
  ): Promise<void> {
    const file = await this.openaiAdapter.uploadBugReportToOpenAI(
      bugReports,
      date,
    );
    await this.openaiAdapter.createVectorFile(file.id, file.filename);
  }

  async searchSimilarBugReport(bugReport: BugReport): Promise<string> {
    const response =
      await this.openaiAdapter.searchBugReportFromOpenAI(bugReport);
    return response.output_text;
  }
}

export const bugReportService = new BugReportService(slackClient);
