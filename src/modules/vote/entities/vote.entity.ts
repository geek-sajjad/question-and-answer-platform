import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { VoteType } from '../vote.enums';
import { Answer } from '../../answer/entities/answer.entity';
import { User } from '../../user/entities/user.entity';

@Unique(['user', 'answer'])
@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VoteType })
  voteType: VoteType;

  @Index()
  @ManyToOne(() => User, (user) => user.votes)
  user: User;

  @Index()
  @ManyToOne(() => Answer, (answer) => answer.votes)
  answer: Answer;

  @CreateDateColumn()
  createdAt: Date;
}
