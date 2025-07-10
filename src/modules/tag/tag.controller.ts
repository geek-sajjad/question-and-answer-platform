import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { Tag } from './entities/tag.entity';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    return this.tagService.create(createTagDto);
  }

  @Get()
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.tagService.findAll(pagination);
  }
}
