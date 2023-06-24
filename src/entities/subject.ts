import { User } from 'src/user/user';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn({ type: 'integer' }) id: number;

  @Column({ type: 'character varying' }) name: string;

  @Column({ type: 'boolean' }) examined: boolean;

  @ManyToMany(() => User, (user) => user.subjects)
  users: User[];
}
