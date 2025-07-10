import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
  forwardRef,
  Inject,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import { AnswerService } from '../answer/answer.service';
import { CreateAnswerDto } from '../answer/dto/create-answer.dto';
import { IsUUID } from 'class-validator';
import { MakeAnswerDto } from './dto/make-answer.dto';

@Controller('questions')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    // @Inject(forwardRef(() => AnswerService))
    private readonly answerService: AnswerService,
  ) {}

  @Post()
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionService.create(createQuestionDto);
  }

  @Get()
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.questionService.findAll(pagination);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Question> {
    const question = await this.questionService.findOne(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  @Post(':id/make-answer')
  async makeAnswer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: MakeAnswerDto,
  ): Promise<Question> {
    await this.answerService.createAnswer({
      content: dto.content,
      questionId: id,
    });

    return this.findOne(id);
  }
}
