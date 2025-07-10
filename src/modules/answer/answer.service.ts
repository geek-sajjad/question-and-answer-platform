import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerRepository } from './answer.repository';
import { QuestionService } from '../question/question.service';

@Injectable()
export class AnswerService {
  constructor(
    private readonly answerRepository: AnswerRepository,
    // @Inject(forwardRef(() => QuestionService))
    private readonly questionService: QuestionService,
  ) {}

  async createAnswer(createAnswerDto: CreateAnswerDto) {
    const { content, questionId } = createAnswerDto;
    const question = await this.questionService.findOne(questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const answer = this.answerRepository.create({
      content: content,
      question,
    });
    return this.answerRepository.save(answer);
  }
}
