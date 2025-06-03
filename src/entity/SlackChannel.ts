import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SlackChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  channelId: string;

  @Column({ nullable: false })
  isPrivate: boolean;

  constructor(channelId: string, name: string, isPrivate: boolean) {
    this.channelId = channelId;
    this.name = name;
    this.isPrivate = isPrivate;
  }
}
