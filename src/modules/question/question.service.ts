import { BadRequestException, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
// import { Tag } from '../tag/entities/tag.entity';
import { QuestionRepository } from './question.repositotry';
import { TagRepository } from '../tag/tag.repository';
import {
  createPaginationMeta,
  getPaginationParams,
} from '../../shared/utils/pagination.util';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import { UserService } from '../user/user.services';
import { QuestionWithStats } from './interfaces/question.interface';
import { CacheKeyBuilder, CacheService } from '../cache';
import { DatabaseOperation } from '../prometheus';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly tagRepository: TagRepository,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {
    // @InjectRepository(Question)
    // private questionRepository: Repository<Question>,
    // @InjectRepository(Tag)
    // private tagRepository: Repository<Tag>,
  }

  @DatabaseOperation('save', 'questions')
  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { title, description, tagIds, userId } = createQuestionDto;

    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException(
        'userId not found, please create user first',
      );
    }
    // Find tags by IDs
    const tags = tagIds ? await this.tagRepository.findByIds(tagIds) : [];

    const question = this.questionRepository.create({
      title,
      description,
      tags,
      user,
    });

    return this.questionRepository.save(question);
  }

  @DatabaseOperation('find', 'questions')
  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<Question>> {
    const { page, limit } = pagination;

    const { safePage, safeLimit, skip } = getPaginationParams(page, limit);

    const cacheKey = CacheKeyBuilder.forList('questions', {
      safePage,
      safeLimit,
    });
    console.log('cacheKey', cacheKey);

    const cachedQuestions =
      await this.cacheService.get<PaginatedResponse<Question>>(cacheKey);

    if (cachedQuestions) {
      console.log('questions retruned from cache');
      return cachedQuestions;
    }

    const [data, totalItems] = await this.questionRepository.findAndCount({
      relations: ['tags', 'answers'],
      skip,
      take: safeLimit,
      order: { createdAt: 'DESC' },
    });

    const meta = createPaginationMeta(
      totalItems,
      safePage,
      safeLimit,
      data.length,
    );

    const response: PaginatedResponse<Question> = { data, meta };

    await this.cacheService.set<PaginatedResponse<Question>>(
      cacheKey,
      response,
    );

    return response;
  }

  @DatabaseOperation('find', 'questions')
  async findAllByTags(
    pagination: PaginationQueryDto,
    tags: string,
  ): Promise<PaginatedResponse<Question>> {
    const { page, limit } = pagination;

    const { safePage, safeLimit, skip } = getPaginationParams(page, limit);

    const cacheKey = CacheKeyBuilder.forList('questions', {
      tags,
      safePage,
      safeLimit,
    });
    console.log('cacheKey', cacheKey);

    const cachedQuestions =
      await this.cacheService.get<PaginatedResponse<Question>>(cacheKey);

    if (cachedQuestions) {
      console.log('questions by tags retruned from cache');
      return cachedQuestions;
    }

    const [data, totalItems] =
      await this.questionRepository.findAllByTagsAndCount(
        tags,
        skip,
        safeLimit,
      );

    const meta = createPaginationMeta(
      totalItems,
      safePage,
      safeLimit,
      data.length,
    );

    const response: PaginatedResponse<Question> = { data, meta };

    await this.cacheService.set<PaginatedResponse<Question>>(
      cacheKey,
      response,
    );

    return response;
  }

  @DatabaseOperation('find', 'questions')
  async findOne(id: string): Promise<QuestionWithStats | null> {
    const cacheKey = CacheKeyBuilder.forEntity('question', id);
    console.log('cacheKey', cacheKey);

    const cachedQuestion =
      await this.cacheService.get<QuestionWithStats | null>(cacheKey);

    if (cachedQuestion) {
      console.log('question retruned from cache');
      return cachedQuestion;
    }

    const question =
      await this.questionRepository.getOneWithVotesStatistics(id);

    await this.cacheService.set<QuestionWithStats | null>(cacheKey, question);

    return question;
  }

  @DatabaseOperation('find', 'questions')
  async statistics(qId: string) {
    const cacheKey = CacheKeyBuilder.build(['question', 'statistics', qId]);
    console.log('cacheKey', cacheKey);

    const cachedStatistics = await this.cacheService.get<{
      totalAnswers: number;
      questionId: string;
    }>(cacheKey);

    if (cachedStatistics) {
      console.log('statistics retruned from cache');
      return cachedStatistics;
    }

    const statistics = await this.questionRepository.getStatistics(qId);
    let totalAnswers = 0;
    if (statistics.length > 0) {
      totalAnswers = statistics[0].total_answers;
    }

    const response = {
      totalAnswers: totalAnswers,
      questionId: qId,
    };

    await this.cacheService.set<{
      totalAnswers: number;
      questionId: string;
    }>(cacheKey, response);

    return response;
  }
}
