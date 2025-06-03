import "reflect-metadata";
import { DataSource } from "typeorm";
import { Sandbox } from "./entity/Sandbox";
import * as dotenv from "dotenv";
import { OnCallSchedule } from "./entity/OnCallSchedule";
import { User } from "./entity/User";
import { BugReport } from "./entity/BugReport";
import { SlackChannel } from "./entity/SlackChannel";
import { TechRequest } from "./entity/TechRequest";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_FILE || "clutch-dev-bot.sqlite",
  synchronize: false,
  logging: false,
  entities: [
    Sandbox,
    User,
    OnCallSchedule,
    BugReport,
    SlackChannel,
    TechRequest,
  ],
  migrations: [],
  subscribers: [],
});
