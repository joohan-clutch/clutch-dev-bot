import { AppDataSource } from "../AppDataSource";
import { Sandbox } from "../entity/Sandbox";
import { DeleteResult } from "typeorm";
import { slackClient } from "../SlackClient";
import { githubAdapter } from "../adapter/GithubAdapter";

export class SandboxService {
  private sandboxRepository = AppDataSource.getRepository(Sandbox);

  async getSandboxes(page: number, pageSize: number): Promise<Sandbox[]> {
    return this.sandboxRepository.find({ skip: page, take: pageSize });
  }

  async addSandbox(name: string): Promise<Sandbox> {
    const sandbox = await this.sandboxRepository.findOne({
      where: { name: name },
    });
    if (sandbox != null) {
      throw new Error(`The sandbox: ${name} already exists.`);
    }
    return this.sandboxRepository.save({ name });
  }

  async removeSandbox(name: string): Promise<DeleteResult> {
    return this.sandboxRepository.delete({ name });
  }

  async bookSandbox(
    name: string,
    usedBy: string,
    ms: number
  ): Promise<Sandbox> {
    const sandbox = await this.sandboxRepository.findOneBy({ name });

    if (sandbox == null) {
      throw new Error(`The sandbox: ${name} does not exist.`);
    }

    if (sandbox.isBooked() && sandbox.bookedBy != usedBy) {
      throw new Error(
        `${name} is already booked by <@${sandbox.bookedBy}>. If you want to book it, please contact the person and cancel by cancel command.`
      );
    }

    sandbox.book(usedBy, ms);

    return this.sandboxRepository.save(sandbox);
  }

  async cancelBookingSandbox(name: string): Promise<Sandbox> {
    const sandbox = await this.sandboxRepository.findOne({
      where: { name: name },
    });
    if (sandbox == null) {
      throw new Error("The sandbox does not exist.");
    }
    sandbox.cancelBook();
    return this.sandboxRepository.save(sandbox);
  }

  async runTest(
    sandboxName: string,
    runBy: string,
    slackChannel: string
  ): Promise<void> {
    const sandbox = await this.sandboxRepository.findOneBy({
      name: sandboxName,
    });
    if (sandbox == null) {
      throw new Error(`The sandbox: ${sandboxName} does not exist.`);
    }

    const response = await githubAdapter.dispatchAction("sanity_test.yml", {
      team: sandbox.name,
    });

    if (response.status !== 204) {
      throw new Error("Failed to run sanity test");
    }

    await slackClient.respondInChannel(
      slackChannel,
      `Sanity check on ${sandbox.name} is started by <@${runBy}>.  <https://github.com/clutchcanada/catalyst-tests/actions/workflows/sanity_test.yml|Click here to view the test run>`
    );
  }
}

export const sandboxService: SandboxService = new SandboxService();
