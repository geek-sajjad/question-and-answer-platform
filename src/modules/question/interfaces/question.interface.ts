import { Answer } from '../../answer/entities/answer.entity';
import { Question } from '../entities/question.entity';

export interface AnswerWithStats extends Answer {
  upvoteCount: number;
  downvoteCount: number;
}

export interface QuestionWithStats extends Question {
  answers: AnswerWithStats[];
}
