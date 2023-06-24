import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from './city';
import { User } from '../user/user';
import { Class } from './class';
import { ScheduleItem } from './schedule';

@Entity({ name: 'school_accounts' })
export class SchoolAccount {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'character varying', nullable: false, unique: true })
  fullName: string;

  @Column({ type: 'character varying', nullable: true })
  shortName: string;

  @Column({ type: 'integer', nullable: false, unique: true })
  edebo: number;

  @Column({ type: 'boolean', nullable: false })
  workStatus: boolean;

  @Column({ type: 'character varying', nullable: false })
  type: string;

  @Column({ type: 'character varying', nullable: false })
  ownership: string;

  @Column({ type: 'character varying', nullable: true, unique: true })
  address: string;

  @Column({ type: 'character varying', nullable: true })
  schoolPnoneNumber: string;

  @Column({ type: 'character varying', nullable: true })
  director: string;

  @Column({
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdDate: Date;

  @ManyToOne(() => City, (city) => city.accounts)
  city: City;

  @OneToMany(() => User, (user) => user.school)
  users: User[];

  @OneToMany(() => Class, (class_) => class_.school)
  classes: Class[];

  @OneToMany(() => ScheduleItem, (scheduleItem) => scheduleItem.school)
  scheduleItems: ScheduleItem[];
}
