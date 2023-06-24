import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user';
import { NotebookPage } from './notebook-page';

@Entity()
export class PupilNotebook {
  @PrimaryGeneratedColumn({ type: 'integer' }) id: number;

  @OneToOne(() => User, (User) => User.id)
  @JoinColumn()
  pupil: number;

  @OneToMany(
    () => NotebookPage,
    (NotebookPage) => NotebookPage.notebookPageByteArr,
  )
  notebookPages: NotebookPage;
}
