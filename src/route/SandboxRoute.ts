import { sandboxService } from "../service/SandboxService";
import { hourMinStringToMilliseconds } from "../util/TimeUtil";
import { SlackCommand } from "../dto/SlackCommand";
import { slackClient } from "../SlackClient";

export const sandboxRoute: {
  [key: string]: (command: SlackCommand) => Promise<void>;
} = {
  async list(command: SlackCommand) {
    const sandBoxes = await sandboxService.getSandboxes(0, 50);
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      sandBoxes.map((s) => s.toString()).join("\n")
    );
  },

  async use(command: SlackCommand) {
    const text: string[] = command.text.split(/\s+/);
    const sandboxName: string = text[1];
    const duration: number = hourMinStringToMilliseconds(
      text.slice(2).join(" ")
    );
    const sandbox = await sandboxService.bookSandbox(
      sandboxName,
      command.user_name,
      duration
    );

    await slackClient.respondInChannel(
      command.channel_id,
      `${sandbox.name} is booked by <@${sandbox.bookedBy}> until ${sandbox.bookedUntil?.toLocaleTimeString()}`
    );
  },

  async add(command: SlackCommand) {
    const text = command.text.split(" ");
    const sandboxName: string = text[1];
    const sandbox = await sandboxService.addSandbox(sandboxName);

    await slackClient.respondInChannel(
      command.channel_id,
      `${sandbox.name} is added by <@${command.user_name}>`
    );
  },

  async cancel(command: SlackCommand) {
    const text = command.text.split(/\s+/);
    const sandboxName: string = text[1];
    await sandboxService.cancelBookingSandbox(sandboxName);

    await slackClient.respondInChannel(
      command.channel_id,
      `The booking for ${sandboxName} is cancelled by <@${command.user_id}>`
    );
  },

  async delete(command: SlackCommand) {
    const text = command.text.split(/\s+/);
    console.log(`Received text: ${text}`);
    const result = await sandboxService.removeSandbox(text[1]);
    if (result.affected !== 1) {
      await slackClient.respondInChannel(
        command.channel_id,
        `The booking for ${text} cannot be deleted`
      );
    }

    await slackClient.respondInChannel(
      command.channel_id,
      `The booking for ${text} is deleted by <@${command.user_id}>`
    );
  },

  async test(command: SlackCommand) {
    const text = command.text.split(" ");
    const sandboxName: string = text[1];
    await sandboxService.runTest(
      sandboxName,
      command.user_name,
      command.channel_id
    );
  },

  async help(command: SlackCommand) {
    await slackClient.respondEphemeral(
      command.channel_id,
      command.user_id,
      "list - List all sandboxes. For example, /sandbox list \n" +
        "use - Specify the sandbox you want to use and the time. For example, /sandbox use saturn 3h(ours) 10m(ins) \n" +
        "cancel - Cancel the sandbox reservation. For example, /sandbox cancel saturn \n" +
        "add - Add sandbox. For example, /sandbox add saturn \n" +
        "delete - Delete sandbox. For example, /sandbox delete saturn \n" +
        "test - Run sanity test. For example, /sandbox test saturn"
    );
  },
};
