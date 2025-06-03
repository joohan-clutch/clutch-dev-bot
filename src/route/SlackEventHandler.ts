import { SlackEventPayload } from "../dto/SlackEvent";
import { slackChannelService } from "../service/SlackChannelService";
import { bugReportUseCase } from "../use_case/BugReportUseCase";
import { techRequestUseCase } from "../use_case/TechRequestUseCase";

export class SlackEventHandler {
  // Currently only handles messages from workflow. We can extend this to handle other events in the future.
  async handleMessage(event: SlackEventPayload) {
    // Skip if it's not from workflow
    // TODO: Add a check for the messenger name
    if (event.event.subtype !== "bot_message") {
      return;
    }

    let slackChannel = await slackChannelService.getSlackChannel(
      event.event.channel
    );

    if (!slackChannel) {
      slackChannel = await slackChannelService.createSlackChannel(
        event.event.channel
      );
    }

    if (slackChannel.name === "bug-reporting") {
      await bugReportUseCase.receiveNewBugReport(
        slackChannel.channelId,
        slackChannel.name,
        event.event.ts,
        event.event.text
      );
    }

    if (slackChannel.name === "tech-request") {
      await techRequestUseCase.receiveNewTechRequest(
        slackChannel.channelId,
        slackChannel.name,
        event.event.ts,
        event.event.text
      );
    }
  }
}

export const slackEventHandler = new SlackEventHandler();
