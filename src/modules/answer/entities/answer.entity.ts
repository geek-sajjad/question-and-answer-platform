import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from '../../question/entities/question.entity';
import { Vote } from '../../vote/entities/vote.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  // @ManyToOne(() => User, (user) => user.answers)
  // user: User;

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;

  @OneToMany(() => Vote, (vote) => vote.answer)
  votes: Vote[];

  @Column({ default: false })
  isAccepted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
