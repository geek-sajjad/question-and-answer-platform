import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from '../../question/entities/question.entity';
import { Answer } from '../../answer/entities/answer.entity';
import { Vote } from '../../vote/entities/vote.entity';

//Note This is simple user just for the testing app functionality, not designed for production env.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @OneToMany(() => Question, (question) => question.user)
  questions: Question[];

  @OneToMany(() => Answer, (answer) => answer.user)
  answers: Answer[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
