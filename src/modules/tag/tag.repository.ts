// import { CustomRepository } from 'typeorm-custom-repository';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/base/base.repository';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// @CustomRepository(Tag)
@Injectable()
export class TagRepository extends BaseRepository<Tag> {
  constructor(@InjectRepository(Tag) repo: Repository<Tag>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createTag(createTagDto: CreateTagDto): Promise<Tag> {
    const { name } = createTagDto;
    return this.createEntity({ name });
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.findOne({ where: { name } });
  }

  async findAllTags(): Promise<Tag[]> {
    return this.findAll();
  }

  async findByIds(ids: string[]) {
    if (!ids.length) return [];

    return this.find({
      where: { id: In(ids) },
    });
  }
}
