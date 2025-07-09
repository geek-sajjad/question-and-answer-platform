import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from './entities/answer.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  voteType: 'UPVOTE' | 'DOWNVOTE';

  //   @ManyToOne(() => User, (user) => user.votes)
  //   user: User;

  @ManyToOne(() => Answer, (answer) => answer.votes)
  answer: Answer;

  @CreateDateColumn()
  createdAt: Date;
}
