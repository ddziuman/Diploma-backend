import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user';
import { SchoolAccount } from './school-account';
import { ScheduleItem } from './schedule';

@Entity()
@Index(['grade', 'sequence', 'school'], { unique: true })
export class Class {
  @PrimaryGeneratedColumn({ type: 'integer' }) id: number;

  @Column({ type: 'integer' })
  grade: number;

  @Column({ type: 'integer' })
  sequence: number;

  @Column({ type: 'character varying', nullable: true })
  name: string;

  @OneToMany(() => User, (User) => User.class)
  pupils: User[];

  @ManyToOne(() => SchoolAccount, (schoolAccount) => schoolAccount.classes)
  school: SchoolAccount;

  @OneToMany(() => ScheduleItem, (scheduleItem) => scheduleItem.class)
  scheduleItems: ScheduleItem[];
}
