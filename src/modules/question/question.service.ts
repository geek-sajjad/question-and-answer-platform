import { Injectable } from '@nestjs/common';
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

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly tagRepository: TagRepository,
  ) {
    // @InjectRepository(Question)
    // private questionRepository: Repository<Question>,
    // @InjectRepository(Tag)
    // private tagRepository: Repository<Tag>,
  }

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { title, description, tagIds } = createQuestionDto;

    // Find tags by IDs
    const tags = tagIds ? await this.tagRepository.findByIds(tagIds) : [];

    const question = this.questionRepository.create({
      title,
      description,
      tags,
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

  async findOne(id: string): Promise<Question | null> {
    return this.questionRepository.findOne({
      where: { id },
      relations: ['tags', 'answers'],
    });
  }
}
