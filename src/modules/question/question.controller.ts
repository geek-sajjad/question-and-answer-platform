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
import { AnswerService } from '../answer/answer.service';
import { MakeAnswerDto } from './dto/make-answer.dto';
import { FilterQuestionsDto } from './dto/get-questions.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import { MarkAnswerCorrectDto } from './dto/mark-answer-correct.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully.',
    type: Question,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get a list of questions with optional filtering by tags',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of questions per page',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'tags',
    type: [String],
    required: false,
    description: 'Array of tags to filter questions',
  })
  @ApiResponse({
    status: 200,
    description: 'List of questions retrieved successfully.',
    // type: PaginatedResponse,
  })
  async findAll(
    @Query() dto: FilterQuestionsDto,
  ): Promise<PaginatedResponse<Question>> {
    const { limit, page, tags } = dto;
    if (tags != undefined) {
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
  @ApiOperation({ summary: 'Get a single question by ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID of the question' })
  @ApiResponse({
    status: 200,
    description: 'Question retrieved successfully.',
    type: Question,
  })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Question> {
    const question = await this.questionService.findOne(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get statistics for a specific question' })
  @ApiParam({ name: 'id', type: String, description: 'UUID of the question' })
  @ApiResponse({
    status: 200,
    description: 'Question statistics retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  async statistics(@Param('id', new ParseUUIDPipe()) id: string) {
    const question = await this.questionService.findOne(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return this.questionService.statistics(id);
  }

  @Post(':id/make-answer')
  @ApiOperation({ summary: 'Create an answer for a specific question' })
  @ApiParam({ name: 'id', type: String, description: 'UUID of the question' })
  @ApiBody({ type: MakeAnswerDto })
  @ApiResponse({
    status: 201,
    description: 'Answer created successfully.',
    type: Question,
  })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async makeAnswer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: MakeAnswerDto,
  ): Promise<Question> {
    await this.answerService.createAnswer({
      content: dto.content,
      questionId: id,
      userId: dto.userId,
    });

    return this.findOne(id);
  }

  @Post(':id/mark-answer-correct')
  @ApiOperation({
    summary: 'Mark an answer as correct for a specific question',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID of the question' })
  @ApiBody({ type: MarkAnswerCorrectDto })
  @ApiResponse({
    status: 200,
    description: 'Answer marked as correct successfully.',
  })
  @ApiResponse({ status: 404, description: 'Question or answer not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async mareAnswerCorrect(
    @Param('id', new ParseUUIDPipe()) questionId: string,
    @Body() dto: MarkAnswerCorrectDto,
  ) {
    await this.answerService.markAnswerCorrect({
      answerId: dto.answerId,
      userId: dto.userId,
      questionId,
    });
    return {
      status: 200,
      message: 'the answer marked as correct',
    };
  }
}
