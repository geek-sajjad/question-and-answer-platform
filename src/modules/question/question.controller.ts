import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
// import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import { AnswerService } from '../answer/answer.service';
import { MakeAnswerDto } from './dto/make-answer.dto';
import { FilterQuestionsDto } from './dto/get-questions.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';

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
  async findAll(
    @Query() dto: FilterQuestionsDto,
  ): Promise<PaginatedResponse<Question>> {
    const { limit, page, tags } = dto;
    if (tags != undefined) {
      console.log(dto);
      return this.questionService.findAllByTags(
        {
          limit,
          page,
        },

        tags,
      );
    }
    return this.questionService.findAll({ limit, page });
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
