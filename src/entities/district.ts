import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Region } from './region';
import { City } from './city';

@Entity({ name: 'districts' })
export class District {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'character varying', nullable: false })
  type: string;

  @Column({ type: 'character varying', nullable: false, unique: true })
  name: string;

  @ManyToOne(() => Region, (region) => region.districts)
  region: Region;

  @OneToMany(() => City, (city) => city.district)
  cities: City[];
}
