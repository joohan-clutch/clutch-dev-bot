import { SlackCommand } from "../dto/SlackCommand";
import { slackClient } from "../SlackClient";
import { onCallService } from "../service/OnCallService";
import { userService } from "../service/UserService";
import { onCallRefreshScheduler } from "../scheduler/OnCallRefreshScheduler";
import { bugReportUseCase } from "../use_case/BugReportUseCase";
import { slackChannelService } from "../service/SlackChannelService";

export const onCallRoute: {
  [key: string]: (command: SlackCommand) => Promise<void>;
} = {
  async users(command: SlackCommand) {
    const response = await userService.registerAllUsersInChannel(
      command.channel_id
    );
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      "Users you can add to on call: \n" +
        response
          .map(
            (user) =>
              `${user.firstName} ${user.lastName} (${user.slackId}) ${user.email}`
          )
          .join("\n")
    );
  },
  async channels(command: SlackCommand) {
    const channels = await slackChannelService.syncInvitedChannels();
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      `Invited channels: ${channels.map((channel) => channel.name).join(", ")}`
    );
  },
  async current(command: SlackCommand) {
    const user = await onCallService.getCurrentOnCallUser();
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      `<@${user.slackId}> is on call for bug reporting`
    );
  },

  async takeover(command: SlackCommand) {
    const user = await userService.getUserByEmailOrSlackId(command.user_id);
    await onCallService.takeover(user);
    await slackClient.respondInChannel(
      command.channel_id,
      `<@${user.slackId}> has taken over on call`
    );
  },
  async cancelTakeover(command: SlackCommand) {
    const user = await onCallService.getCurrentOnCallUser();
    await onCallService.cancelTakeover();
    await slackClient.respondInChannel(
      command.channel_id,
      `Takeover of <@${user.slackId}> is cancelled by <@${command.user_id}>`
    );
  },

  async refresh(command: SlackCommand) {
    await onCallRefreshScheduler.refresh();
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      "On call schedule refreshed"
    );
  },

  async updateReplies(command: SlackCommand) {
    const text: string[] = command.text.split(/\s+/).slice(1);
    const startAt = new Date(text[0] + "T00:00:00.00");
    const endAt = new Date(text[1] + "T23:59:59.99");

    await bugReportUseCase.addSlackRepliesToBugReport(startAt, endAt);
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      `Updated replies and permalink for bug reports from ${startAt} to ${endAt}`
    );
  },
  async uploadToVector(command: SlackCommand) {
    const text: string[] = command.text.split(/\s+/).slice(1);
    const startAt = new Date(text[0] + "T00:00:00.00");
    const endAt = new Date(text[1] + "T23:59:59.99");

    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      `Started uploading bug reports to vector store from ${startAt} to ${endAt}`
    );

    await bugReportUseCase.storeBugReportsInVectorStore(startAt, endAt);
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      `Uploaded bug reports to vector store from ${startAt} to ${endAt}`
    );
  },
  async similarReport(command: SlackCommand) {
    const text: string[] = command.text.split(/\s+/).slice(1);
    const bugReportId = Number(text[0]);

    await bugReportUseCase.commentTicketWithRelatedBugReport(bugReportId);
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      `Commented the jira issue with similar bug reports`
    );
  },

  async help(command: SlackCommand) {
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      "users - List users in the current channel. For example, /oncall users \n" +
        "current - Get the current user on call. For example, /oncall current \n" +
        "takeover - Take over on call for the current user. For example, /oncall takeover \n" +
        "cancelTakeover - Cancel takeover of the current user. For example, /oncall cancelTakeover \n" +
        "refresh - Refresh the on call schedule. For example, /oncall refresh"
    );
  },
};
