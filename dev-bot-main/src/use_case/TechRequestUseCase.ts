import { onCallService } from "../service/OnCallService";
import { techRequestService } from "../service/TechRequestService";

export class TechRequestUseCase {
  async receiveNewTechRequest(
    channelId: string,
    channelName: string,
    messageId: string,
    text: string
  ): Promise<void> {
    // Temporary hardcoded Tai until Thursday
    // const currentOnCallUser = await onCallService.getCurrentOnCallUser();
    await techRequestService.createTechRequest(
      channelId,
      messageId,
      "U060GBX08V9",
      text
    );

    const threadLink = `https://slack.com/app_redirect?channel=${channelId}&message_ts=${messageId}`;

    await onCallService.notifyOnCallUser(
      channelId,
      messageId,
      ["U060GBX08V9"],
      `There is a new tech request in #${channelName}\n${threadLink}`,
      `<@U060GBX08V9> is on call for tech requests`
    );
  }
}
export const techRequestUseCase = new TechRequestUseCase();
