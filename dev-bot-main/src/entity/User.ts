import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName?: string;

  @Column()
  lastName?: string;

  @Column({ nullable: false, unique: true })
  slackId: string;

  @Column({ nullable: true })
  jiraAccountId?: string;

  @Column()
  email?: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(
    slackId: string,
    email: string,
    firstName?: string,
    lastName?: string
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.slackId = slackId;
    this.email = email;
  }
}
