import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { District } from './district';

@Entity({ name: 'regions' })
export class Region {
  @PrimaryGeneratedColumn({ type: 'integer' }) id: number;

  @Column({ type: 'character varying', nullable: false, unique: true })
  name: string;

  @OneToMany(() => District, (district) => district.region)
  districts: District[];
}
