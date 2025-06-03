import { In, LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../AppDataSource";
import { User } from "../entity/User";
import { slackClient } from "../SlackClient";
import { OnCallSchedule } from "../entity/OnCallSchedule";
import { NoActiveOnCallScheduleError } from "../error/onCall/NoActiveOnCallScheduleError";
import { NoPrimaryOnCallUserError } from "../error/onCall/NoPrimaryOncallUserError";
import * as dotenv from "dotenv";
import { Repository } from "typeorm/repository/Repository";

dotenv.config();

export class OnCallService {
  private readonly userRepository: Repository<User>;
  private readonly onCallScheduleRepository: Repository<OnCallSchedule>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.onCallScheduleRepository = AppDataSource.getRepository(OnCallSchedule);
  }

  async getCurrentOnCallUser(): Promise<User> {
    const onCallSchedule = await this.getCurrentOnCallSchedule();

    return this.userRepository.findOneByOrFail({
      id: onCallSchedule.getCurrentOnCallUserId(),
    });
  }
  async getCurrentSecondaryOnCallUsers(): Promise<User[]> {
    const onCallSchedule = await this.getCurrentOnCallSchedule();

    if (
      onCallSchedule?.secondaryUserIds == null ||
      onCallSchedule.secondaryUserIds.length === 0
    ) {
      return [];
    }

    return this.userRepository.find({
      where: { id: In(onCallSchedule?.secondaryUserIds) },
    });
  }

  async addOnCallSchedule(
    primaryOnCallUserId: number,
    startDate: Date,
    endDate: Date,
    secondaryOnCallUserIds?: number[],
  ): Promise<OnCallSchedule> {
    const onCallSchedule = new OnCallSchedule(
      primaryOnCallUserId,
      startDate,
      endDate,
    );

    if (secondaryOnCallUserIds != null && secondaryOnCallUserIds.length > 0) {
      onCallSchedule.addSecondaryUsers(secondaryOnCallUserIds);
    }

    return this.onCallScheduleRepository.save(onCallSchedule);
  }

  async removeOnCallSchedule(onCallScheduleId: number) {
    await this.onCallScheduleRepository.delete(onCallScheduleId);
  }

  async notifyOnCallUser(
    channelId: string,
    threadTs: string,
    userSlackIdsToNotify: string[],
    directMessageContent: string,
    threadMessageContent: string,
  ) {
    try {
      for (const userSlackId of userSlackIdsToNotify) {
        await slackClient.sendDirectMessage(userSlackId, directMessageContent);
      }

      await slackClient.replyOnThread(
        channelId,
        threadTs,
        threadMessageContent,
      );
    } catch (error) {
      if (error instanceof NoActiveOnCallScheduleError) {
        await slackClient.replyOnThread(
          channelId,
          threadTs,
          "Currently no one is on call for bug reporting",
        );
      } else if (error instanceof NoPrimaryOnCallUserError) {
        await slackClient.replyOnThread(
          channelId,
          threadTs,
          "Currently no primary on call user is set for bug reporting",
        );
      } else {
        console.error(error);
      }
    }
  }

  async takeover(user: User) {
    const onCallSchedule = await this.getCurrentOnCallSchedule();

    if (onCallSchedule == null) {
      throw new NoActiveOnCallScheduleError();
    }

    onCallSchedule.takeover(user.id);

    await this.onCallScheduleRepository.save(onCallSchedule);
    await this.userRepository.save(user);
  }

  async getCurrentOnCallSchedule(): Promise<OnCallSchedule> {
    const now = new Date();
    const schedule = await this.onCallScheduleRepository.findOneBy({
      startDate: LessThan(now),
      endDate: MoreThan(now),
    });

    if (schedule == null) {
      throw new NoActiveOnCallScheduleError();
    }

    return schedule;
  }

  async cancelTakeover() {
    const onCallSchedule = await this.getCurrentOnCallSchedule();

    if (onCallSchedule == null) {
      throw new NoActiveOnCallScheduleError();
    }

    onCallSchedule.cancelTakeover();

    await this.onCallScheduleRepository.save(onCallSchedule);
  }
}

export const onCallService: OnCallService = new OnCallService();
