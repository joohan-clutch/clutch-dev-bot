import * as dotenv from "dotenv";
import "reflect-metadata";
import { AppDataSource } from "./AppDataSource";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { sandboxRoute } from "./route/SandboxRoute";
import { SlackCommand } from "./dto/SlackCommand";
import { slackClient } from "./SlackClient";
import { onCallRoute } from "./route/onCallRoute";
import { slackEventHandler } from "./route/SlackEventHandler";
import { SlackEventPayload } from "./dto/SlackEvent";
import { githubActionRoute } from "./route/GithubActionRoute";

dotenv.config();

const app = express();
const port = process.env.APP_PORT || 5555;

AppDataSource.initialize().catch((error) => console.log(error));

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ error: err.body }); // Send a generic error response
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/sandbox", async (req: Request, res: Response) => {
  if (!req.body.text) {
    res.status(404).send("Missing commands for sandbox.");
    return;
  }

  const route = req.body.text.split(/\s+/)[0];

  if (!Object.keys(sandboxRoute).includes(route)) {
    await slackClient.respondEphemeral(
      req.body.channel_id,
      req.body.user_id,
      `Unexpected command. These are available commands ${Object.keys(sandboxRoute).join(", ")}`
    );
    res.status(200).send();
    return;
  }
  const slackCommand = new SlackCommand({ ...req.body });

  try {
    await sandboxRoute[route](slackCommand);
    res.status(200).send();
  } catch (error) {
    const err = error as Error;
    console.log(err.message, err.stack);

    await slackClient.respondEphemeral(
      req.body.channel_id,
      req.body.user_id,
      err.message
    );
    res.status(200).send();
  }
});

app.post("/onCall", async (req: Request, res: Response) => {
  if (!req.body.text) {
    res.status(404).send("Missing commands for on call.");
    return;
  }

  const route = req.body.text.split(/\s+/)[0];

  if (!Object.keys(onCallRoute).includes(route)) {
    await slackClient.respondEphemeral(
      req.body.channel_id,
      req.body.user_id,
      `Unexpected command. These are available commands ${Object.keys(onCallRoute).join(", ")}`
    );
    res.status(200).send();
    return;
  }
  const slackCommand = new SlackCommand({ ...req.body });

  try {
    res.status(200).send(); // Respond immediately to avoid timeout. The result of execution will be sent via slack messages.
    await onCallRoute[route](slackCommand);
  } catch (error) {
    const err = error as Error;
    console.log(err.message, err.stack);

    await slackClient.respondEphemeral(
      req.body.channel_id,
      req.body.user_id,
      err.message
    );
    res.status(200).send();
  }
});

app.post(
  "/githubAction/notifyChannelTestFailure",
  async (req: Request, res: Response) => {
    await githubActionRoute.notifyChannelTestFailure();
    res.status(200).send();
  }
);

app.post("/events", async (req: Request, res: Response) => {
  const eventPayload = req.body as SlackEventPayload;
  try {
    console.log("Received event", eventPayload);
    await slackEventHandler.handleMessage(eventPayload);
  } catch (error) {
    console.error(error);
  }

  return res.status(200).send({ challenge: req.body.challenge });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
