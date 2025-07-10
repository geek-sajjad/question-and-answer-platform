import { Injectable, ConflictException } from '@nestjs/common';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagRepository } from './tag.repository';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import {
  createPaginationMeta,
  getPaginationParams,
} from '../../shared/utils/pagination.util';

@Injectable()
export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const { name } = createTagDto;

    // Check if tag already exists
    const existingTag = await this.tagRepository.findOne({ where: { name } });
    if (existingTag) {
      throw new ConflictException(`Tag with name ${name} already exists`);
    }

    const tag = this.tagRepository.create({ name });
    return this.tagRepository.save(tag);
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<Tag>> {
    const { page, limit } = pagination;

    const { safePage, safeLimit, skip } = getPaginationParams(page, limit);

    const [data, totalItems] = await this.tagRepository.findAndCount({
      skip,
      take: safeLimit,
    });

    const meta = createPaginationMeta(
      totalItems,
      safePage,
      safeLimit,
      data.length,
    );

    return { data, meta };
  }
}
