import cron from "node-cron";
import { confluenceService } from "../service/ConfluenceService";
import { userService } from "../service/UserService";
import { onCallService } from "../service/OnCallService";
import { NoActiveOnCallScheduleError } from "../error/onCall/NoActiveOnCallScheduleError";

export class OnCallRefreshScheduler {
  constructor() {
    // Task runs every day 9AM
    cron.schedule("0 9 * * *", this.refresh).start();
  }

  async refresh() {
    try {
      const onCallSchedule = await confluenceService.getOnCallSchedule();
      const today = new Date();
      const onCallStartAt = new Date(today.setHours(9, 0, 0, 0));
      const onCallEndAt = new Date(
        onCallStartAt.getTime() + 24 * 60 * 60 * 1000
      ); // 24 hours from now

      const onCallScheduleForToday = onCallSchedule.filter((row) => {
        return row.startDate <= today && row.endDate >= today;
      });

      if (onCallScheduleForToday.length === 0) {
        console.error("No on call schedule for today");
        return;
      }

      if (onCallScheduleForToday.length > 1) {
        console.error("More than 1 on call schedule for today");
        return;
      }

      const [primaryOnCallUserName, ...secondaryOnCallUserNames] =
        onCallScheduleForToday[0].name.split(",").map((user) => user.trim());

      const primaryOnCallUser = await userService.getUserByFirstOrLastName(
        primaryOnCallUserName
      );

      const secondaryOnCallUserIds = await Promise.all(
        secondaryOnCallUserNames.map((user) =>
          userService.getUserByFirstOrLastName(user)
        )
      ).then((users) => users.map((user) => user.id));

      try {
        const { id } = await onCallService.getCurrentOnCallSchedule();
        await onCallService.removeOnCallSchedule(id);
      } catch (error) {
        if (error instanceof NoActiveOnCallScheduleError) {
          console.info("No active on call schedule found");
        } else {
          console.error("Error removing current on call schedule:", error);
        }
      }

      await onCallService.addOnCallSchedule(
        primaryOnCallUser.id,
        onCallStartAt,
        onCallEndAt,
        secondaryOnCallUserIds
      );
    } catch (error) {
      console.error("Error in daily on-call refresh:", error);
    }
  }
}

export const onCallRefreshScheduler = new OnCallRefreshScheduler();
