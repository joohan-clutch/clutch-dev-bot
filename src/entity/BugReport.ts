import he from "he";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class BugReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromUserSlackId: string;

  @Column()
  channelId: string;

  @Column()
  messageId: string;

  @Column({ nullable: true })
  jiraIssueKey: string;

  @Column({ nullable: true })
  request: string;

  @Column({ nullable: true })
  linkToCustomerProfile: string;

  @Column({ nullable: true })
  details: string;

  @Column({ nullable: true })
  howToReproduce: string;

  @Column({ nullable: true })
  urgency: string;

  @Column("json", {
    nullable: true,
  })
  categories: string[];

  @Column({ default: false })
  isThereAWorkaround: boolean;

  @Column({ nullable: true })
  currentOnCallUserSlackId: string;

  @Column({ nullable: true })
  permalink: string;

  @Column()
  isAcknowledged: boolean;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @Column()
  text: string;

  @Column("json", {
    nullable: true,
  })
  replies?: { message: string }[];

  @CreateDateColumn()
  createdAt: Date;

  constructor(
    channelId: string,
    messageId: string,
    currentOnCallUserSlackId: string,
    text: string,
    permalink: string,
  ) {
    this.channelId = channelId;
    this.currentOnCallUserSlackId = currentOnCallUserSlackId;
    this.messageId = messageId;
    this.isAcknowledged = false;
    this.text = text;
    this.permalink = permalink;

    if (text) {
      try {
        this.parseRequest(text);
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to parse request from bug report text}`);
      }
    }
  }

  private parseRequest(text: string): void {
    const sections: Record<string, string> = {
      "from:": "fromUserSlackId",
      "category:": "categories",
      "request:": "request",
      "urgency:": "urgency",
      "reproducing the issue:": "howToReproduce",
      "link to customer profile:": "linkToCustomerProfile",
      "is there a workaround:": "isThereAWorkaround",
      "details and possible workaround:": "details",
    };

    const lines = text.split("\n").map((line) => line.trim());
    let currentSection: string | null = null;
    const contentBuffer: string[] = [];

    for (const line of lines) {
      const matchedSection = Object.keys(sections).find((section) =>
        line.toLowerCase().startsWith(section),
      );

      if (matchedSection) {
        if (currentSection) {
          this.setField(
            sections[currentSection],
            contentBuffer.join("\n").trim(),
          );
          contentBuffer.length = 0;
        }
        currentSection = matchedSection;
        continue;
      }

      if (currentSection) {
        contentBuffer.push(line);
      }
    }

    if (currentSection && contentBuffer.length > 0) {
      this.setField(sections[currentSection], contentBuffer.join("\n").trim());
    }
  }

  private setField(field: string, value: string): void {
    if (field === "fromUserSlackId") {
      this[field] = value.replace(/[@<>]/g, "").trim();
    } else if (field === "isThereAWorkaround") {
      this[field] = value.toLowerCase().includes("yes");
    } else if (field === "categories") {
      this[field] = he
        .decode(value)
        .split(",")
        .map((category) => category.trim());
    } else {
      this[field] = value;
    }
  }
}
