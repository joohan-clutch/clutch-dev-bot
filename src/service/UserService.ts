import { EntityManager } from "typeorm";
import { AppDataSource } from "../AppDataSource";
import { User } from "../entity/User";
import { UserNotFoundError } from "../error/user/UserNotFoundError";
import { slackClient } from "../SlackClient";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getUserByEmailOrSlackId(emailOrSlackId: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where("user.slackId = :slackId", { slackId: emailOrSlackId })
      .orWhere("user.email = :email", { email: emailOrSlackId })
      .getOne();

    if (user == null) {
      throw new UserNotFoundError();
    }

    return user;
  }

  async getUserByFirstOrLastName(
    firstName?: string,
    lastName?: string
  ): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where("LOWER(user.firstName) LIKE LOWER(:firstName)", {
        firstName: `%${firstName}%`,
      })
      .orWhere("LOWER(user.lastName) LIKE LOWER(:lastName)", {
        lastName: `%${lastName}%`,
      })
      .getOne();

    if (user == null) {
      throw new UserNotFoundError();
    }

    return user;
  }

  async registerAllUsersInChannel(channelId: string): Promise<Partial<User>[]> {
    const userSlackIds = await slackClient.getUserSlackIdsInChannel(channelId);

    for (const slackId of userSlackIds) {
      await AppDataSource.transaction(
        async (transactionalEntityManager: EntityManager) => {
          const user = await transactionalEntityManager.findOneBy(User, {
            slackId,
          });
          if (user == null) {
            const userInfo = await slackClient.getUserInfo(slackId);

            if (userInfo.user.is_bot) {
              return;
            }

            const user = new User(
              slackId,
              userInfo.user.profile.email,
              userInfo.user.profile.first_name,
              userInfo.user.profile.last_name
            );
            await transactionalEntityManager.save(user);
          }
        }
      );
    }
    const users = (await this.userRepository.find()).map((user) => {
      return {
        slackId: user.slackId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
    });
    return users;
  }
}

export const userService = new UserService();
