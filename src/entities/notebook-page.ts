import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PupilNotebook } from './pupil-notebook';

@Entity()
export class NotebookPage {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @ManyToOne(() => PupilNotebook, (PupilNotebook) => PupilNotebook.id)
  @JoinColumn()
  notebook: number;

  @Column({ type: 'integer' }) pageNumber: number;

  @Column({
    type: 'bytea',
    nullable: false,
  })
  notebookPageByteArr: Buffer;
}
