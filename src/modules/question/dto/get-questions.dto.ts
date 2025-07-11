// src/question/dto/filter-questions.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FilterQuestionsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description:
      'Comma-separated list of tag names to filter questions (e.g., "js,node,web")',
    type: String,
    example: 'js,node,web',
    required: false,
  })
  tags?: string;
}
