import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VoteType } from '../vote.enums';
import { Answer } from '../../answer/entities/answer.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VoteType })
  voteType: VoteType;

  @ManyToOne(() => User, (user) => user.votes)
  user: User;

  @ManyToOne(() => Answer, (answer) => answer.votes)
  answer: Answer;

  @CreateDateColumn()
  createdAt: Date;
}
