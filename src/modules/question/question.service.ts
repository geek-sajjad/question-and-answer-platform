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

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly tagRepository: TagRepository,
    private readonly userService: UserService,
  ) {
    // @InjectRepository(Question)
    // private questionRepository: Repository<Question>,
    // @InjectRepository(Tag)
    // private tagRepository: Repository<Tag>,
  }

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

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<Question>> {
    const { page, limit } = pagination;

    const { safePage, safeLimit, skip } = getPaginationParams(page, limit);

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

    return { data, meta };
  }

  async findAllByTags(
    pagination: PaginationQueryDto,
    tags: string,
  ): Promise<PaginatedResponse<Question>> {
    const { page, limit } = pagination;

    const { safePage, safeLimit, skip } = getPaginationParams(page, limit);

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

    return { data, meta };
  }

  async findOne(id: string): Promise<Question | null> {
    return this.questionRepository.findOne({
      where: { id },
      relations: ['tags', 'answers', 'answers.user', 'user'],
    });
  }

  async statistics(qId: string) {
    const statistics = await this.questionRepository.getStatistics(qId);
    let totalAnswers = 0;
    if (statistics.length > 0) {
      totalAnswers = statistics[0].total_answers;
    }
    return {
      totalAnswers: totalAnswers,
      questionId: qId,
    };
  }
}
