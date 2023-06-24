import {
  Column,
  Entity,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Min, Max } from 'class-validator';
import { SchoolAccount } from './school-account';
import { Class } from './class';
import { User } from 'src/user/user';
import { Subject } from './subject';

export enum WeekDays {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
}
@Entity()
@Index(['slot', 'school', 'class', 'weekDay'], {
  unique: true,
})
export class ScheduleItem {
  @PrimaryGeneratedColumn({ type: 'integer' }) id: number;

  @ManyToOne(() => SchoolAccount, (schoolAcc) => schoolAcc.scheduleItems)
  school: SchoolAccount;

  @ManyToOne(() => Class, (class_) => class_.scheduleItems)
  class: Class;

  @Column({ type: 'enum', enum: WeekDays })
  weekDay: WeekDays;

  @Min(1)
  @Max(7)
  @Column({ type: 'integer' })
  slot: number;

  @ManyToOne(() => User)
  teacher: User;

  @ManyToOne(() => Subject)
  subject: Subject;

  @Column({ type: 'character varying' })
  description: string;
}
