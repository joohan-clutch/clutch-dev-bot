import { AppDataSource } from "../AppDataSource";
import { SlackChannel } from "../entity/SlackChannel";
import { SlackClient, slackClient } from "../SlackClient";
import { In, Repository } from "typeorm";
export class SlackChannelService {
  private channelRepository: Repository<SlackChannel>;
  private slackClient: SlackClient;

  constructor(slackClient: SlackClient) {
    this.channelRepository = AppDataSource.getRepository(SlackChannel);
    this.slackClient = slackClient;
  }

  async syncInvitedChannels(): Promise<SlackChannel[]> {
    const invitedChannels = await this.slackClient.getInvitedChannels();
    const existingChannels = await this.channelRepository.find({
      where: {
        channelId: In(invitedChannels.map((channel) => channel.channel.id)),
      },
    });
    const newlyInvitedChannels: SlackChannel[] = invitedChannels
      .filter(
        (channel) =>
          !existingChannels.some((c) => c.channelId === channel.channel.id)
      )
      .map(
        (channel) =>
          new SlackChannel(
            channel.channel.id,
            channel.channel.name,
            channel.channel.is_private
          )
      );

    await this.channelRepository.save(newlyInvitedChannels);
    return [...existingChannels, ...newlyInvitedChannels];
  }

  async getSlackChannel(channelId: string): Promise<SlackChannel> {
    const channel = await this.channelRepository.findOneBy({ channelId });
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }
    return channel;
  }

  async getSlackChannelByName(name: string): Promise<SlackChannel> {
    const channel = await this.channelRepository.findOneBy({ name });
    if (!channel) {
      throw new Error(`Channel ${name} not found`);
    }
    return channel;
  }

  async createSlackChannel(channelId: string): Promise<SlackChannel> {
    const channelInfo = await this.slackClient.getChannelInfo(channelId);

    return this.channelRepository.create(
      new SlackChannel(
        channelId,
        channelInfo.channel.name,
        channelInfo.channel.is_private
      )
    );
  }
}
export const slackChannelService = new SlackChannelService(slackClient);
