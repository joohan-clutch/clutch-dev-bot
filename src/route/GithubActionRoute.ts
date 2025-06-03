import { SlackCommand } from "../dto/SlackCommand";
import { slackChannelService } from "../service/SlackChannelService";
import { slackClient, SlackClient } from "../SlackClient";

export class GithubActionRoute {
  private readonly slackClient: SlackClient;

  constructor(slackClient: SlackClient) {
    this.slackClient = slackClient;
  }

  async notifyChannelTestFailure() {
    const channel =
      await slackChannelService.getSlackChannelByName("pathfinder");

    await this.slackClient.respondInChannel(
      channel.channelId,
      `The sanity check for parts on staging failed. <https://github.com/clutchcanada/catalyst-tests/actions/workflows/sanity_test.yml|Click here to view the test run>`
    );
  }
}

export const githubActionRoute = new GithubActionRoute(slackClient);
