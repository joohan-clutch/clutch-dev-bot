import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class TechRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromUserSlackId: string;

  @Column()
  channelId: string;

  @Column()
  messageId: string;

  @Column({ nullable: true })
  request: string;

  @Column({ nullable: true })
  adminLink: string;

  @Column({ nullable: true })
  requestDetails: string;

  @Column({ nullable: true })
  currentOnCallUserSlackId: string;

  @Column()
  text: string;

  @Column("json", {
    nullable: true,
  })
  replies: { message: string }[];

  @CreateDateColumn()
  createdAt: Date;

  constructor(
    channelId: string,
    messageId: string,
    currentOnCallUserSlackId: string,
    text: string,
  ) {
    this.channelId = channelId;
    this.currentOnCallUserSlackId = currentOnCallUserSlackId;
    this.messageId = messageId;
    this.text = text;

    if (text) {
      try {
        this.parseRequest(text);
      } catch (error) {
        throw new Error("Failed to parse request from bug report text");
      }
    }
  }

  private parseRequest(text: string): void {
    const sections: Record<string, string> = {
      requester: "fromUserSlackId",
      request: "request",
      "admin link": "adminLink",
      "request details": "requestDetails",
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
    } else {
      this[field] = value;
    }
  }
}
