import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerRepository } from './answer.repository';
import { QuestionService } from '../question/question.service';
import { UserService } from '../user/user.services';
import { MarkAnswerCorrectDto } from './dto/mark-answer-correct.dto';

@Injectable()
export class AnswerService {
  constructor(
    private readonly answerRepository: AnswerRepository,
    // @Inject(forwardRef(() => QuestionService))
    private readonly questionService: QuestionService,
    private readonly userService: UserService,
  ) {}

  async createAnswer(createAnswerDto: CreateAnswerDto) {
    const { content, questionId, userId } = createAnswerDto;
    const question = await this.questionService.findOne(questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    if (question.user.id === userId) {
      throw new BadRequestException('You cannot answer your own question');
    }

    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException(
        'userId not found, please create user first',
      );
    }

    const answer = this.answerRepository.create({
      content: content,
      question,
    });
    return this.answerRepository.save(answer);
  }

  async findOne(id: string) {
    return this.answerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async markAnswerCorrect(dto: MarkAnswerCorrectDto) {
    const { answerId, userId, questionId } = dto;

    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: ['question', 'question.user', 'user'],
    });

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`);
    }

    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException(
        'userId not found, please create user first',
      );
    }

    if (answer.question.id !== questionId)
      throw new BadRequestException(
        'The answer is not related for the question',
      );

    if (answer.question.user.id !== userId)
      throw new BadRequestException('You are not the question owner');

    return this.answerRepository.update(answerId, { isAccepted: true });
  }
}
