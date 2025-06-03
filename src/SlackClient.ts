import axios from "axios";
import { SlackUserInfo } from "./dto/SlackUserInfo";
import { SlackChannelResponse } from "./dto/SlackChannelInfo";
import { SlackReply } from "./dto/slack/SlackReply";

export class SlackClient {
  async respondEphemeral(channelId: string, userId: string, text: string) {
    try {
      await axios.post(
        `https://slack.com/api/chat.postEphemeral`,
        { channel: channelId, text: text, user: userId },
        {
          headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async respondInChannel(channelId: string, text: string) {
    try {
      await axios.post(
        `https://slack.com/api/chat.postMessage`,
        { channel: channelId, text: text },
        {
          headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getUserSlackIdsInChannel(channelId: string): Promise<string[]> {
    try {
      const response = await axios.get(
        `https://slack.com/api/conversations.members?channel=${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          },
        }
      );

      if (!response.data?.ok) {
        throw new Error(response.data?.error);
      }

      return response.data?.members;
    } catch (error) {
      console.log(error);
      return Promise.resolve([]);
    }
  }

  async getUserInfo(userId: string): Promise<SlackUserInfo> {
    const response = await axios.get(
      `https://slack.com/api/users.info?user=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      }
    );

    if (!response.data?.ok) {
      throw new Error(response.data?.error);
    }

    return response.data;
  }

  async getChannelInfo(channelId: string): Promise<SlackChannelResponse> {
    const response = await axios.get<SlackChannelResponse>(
      `https://slack.com/api/conversations.info?channel=${channelId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      }
    );

    if (response.status !== 200 || !response.data?.ok) {
      throw new Error(`Failed to get channel info: ${response.data}`);
    }

    return response.data;
  }

  async replyOnThread(channelId: string, threadTs: string, message: string) {
    await axios.post(
      `https://slack.com/api/chat.postMessage`,
      { channel: channelId, text: message, thread_ts: threadTs },
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      }
    );
  }

  async sendDirectMessage(userId: string, message: string) {
    await axios.post(
      `https://slack.com/api/chat.postMessage`,
      { channel: userId, text: message },
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      }
    );
  }

  async getThreadReplies(
    channelId: string,
    ts: string
  ): Promise<SlackReply[] | null> {
    const response = await axios.get(
      `https://slack.com/api/conversations.replies?channel=${channelId}&ts=${ts}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      }
    );

    return response?.data?.messages;
  }

  async getPermalink(channelId: string, ts: string): Promise<string> {
    const response = await axios.get(
      `https://slack.com/api/chat.getPermalink?channel=${channelId}&message_ts=${ts}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      }
    );

    return response?.data?.permalink;
  }

  async getInvitedChannels(): Promise<SlackChannelResponse[]> {
    const response = await axios.get<{
      ok: boolean;
      channels: SlackChannelResponse[];
    }>(`https://slack.com/api/users.conversations`, {
      params: {
        types: "public_channel,private_channel",
      },
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
    });

    if (!response.data?.ok) {
      throw new Error(`Failed to get invited channels: ${response.data}`);
    }

    return response?.data?.channels;
  }
}

export const slackClient = new SlackClient();
