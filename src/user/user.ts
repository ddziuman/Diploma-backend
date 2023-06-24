import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from 'src/user/role.enum';
import { SchoolAccount } from '../entities/school-account';
import { Class } from '../entities/class';
import { Subject } from 'src/entities/subject';
import { ScheduleItem } from 'src/entities/schedule';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'integer' }) id: number;

  @Column({
    nullable: false,
    type: 'character varying',
    default: 'test@gmail.com',
    unique: true,
  })
  email: string;
  @Column({ nullable: false, type: 'character varying', default: '456' })
  password: string;
  @Column({ type: 'enum', enum: Role, default: Role.Pupil })
  role: Role;

  @Column({ nullable: false, type: 'character varying', default: 'Oleksandr' })
  firstName: string;
  @Column({ nullable: false, type: 'character varying', default: 'Soluian' })
  lastName: string;

  @ManyToOne(() => SchoolAccount, (schoolAccount) => schoolAccount.users)
  school: SchoolAccount;

  @Column({ nullable: true, type: 'character varying', default: '098' })
  phoneNumber: string;

  @ManyToOne(() => Class, (cls) => cls.pupils)
  class: Class;
  @OneToMany(() => ScheduleItem, (ScheduleItem) => ScheduleItem.teacher)
  scheduleItems: ScheduleItem[];

  @ManyToMany(() => Subject, (subject) => subject.users)
  @JoinTable()
  subjects: Subject[];
  @BeforeInsert()
  @BeforeUpdate()
  emailLowercase() {
    this.email = this.email.toLocaleLowerCase();
  }
}
