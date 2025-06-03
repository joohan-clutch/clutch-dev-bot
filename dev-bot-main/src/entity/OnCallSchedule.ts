import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class OnCallSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  primaryUserId: number;

  @Column("json", {
    nullable: true,
  })
  secondaryUserIds?: number[];

  @Column({ nullable: true })
  takeoverByUserId?: number;

  @Column({ nullable: false })
  startDate: Date;

  @Column({ nullable: false })
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor(
    primaryUserId: number,
    startDate: Date,
    endDate: Date,
    secondaryUserIds?: number[]
  ) {
    this.primaryUserId = primaryUserId;
    this.secondaryUserIds = secondaryUserIds;
    this.startDate = startDate;
    this.endDate = endDate;
  }
  addSecondaryUsers(secondaryUserIds: number[]): void {
    this.secondaryUserIds = [
      ...(this.secondaryUserIds || []),
      ...secondaryUserIds,
    ];
  }

  takeover(userId: number): void {
    this.takeoverByUserId = userId;
  }

  cancelTakeover(): void {
    this.takeoverByUserId = undefined;
  }

  getCurrentOnCallUserId(): number {
    if (this.takeoverByUserId) {
      return this.takeoverByUserId;
    }

    return this.primaryUserId;
  }
}
