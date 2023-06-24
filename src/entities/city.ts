import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { District } from './district';
import { SchoolAccount } from './school-account';

@Entity({ name: 'cities' })
export class City {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'character varying', nullable: true })
  type: string;

  @Column({ type: 'character varying', nullable: false, unique: true })
  name: string;

  @ManyToOne(() => District, (district) => district.cities)
  district: District;

  @OneToMany(() => SchoolAccount, (account) => account.city)
  accounts: SchoolAccount[];
}
