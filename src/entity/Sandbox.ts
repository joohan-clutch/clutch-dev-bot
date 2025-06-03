import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { millisecondsToHourMinSecondString } from "../util/TimeUtil";

@Entity()
export class Sandbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ type: "varchar", nullable: true })
  bookedBy: string | null;

  @Column({ nullable: true, type: "datetime" })
  bookedUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date; // Deletion date

  isBooked(): boolean {
    return this.bookedUntil != null && Date.now() < this.bookedUntil.getTime();
  }
  book(usedBy: string, ms: number) {
    this.bookedBy = usedBy;
    this.bookedUntil = new Date(Date.now() + ms);
  }
  cancelBook() {
    this.bookedUntil = null;
    this.bookedBy = null;
  }

  toString() {
    if (!this.isBooked()) {
      return `${this.name}: available`;
    }
    const timeLeft = this.bookedUntil!.getTime() - Date.now();
    return `${this.name}: ${this.bookedUntil?.toLocaleDateString()} ${this.bookedUntil?.toLocaleTimeString()} by <@${this.bookedBy}> (${millisecondsToHourMinSecondString(timeLeft)} left)`;
  }
}
