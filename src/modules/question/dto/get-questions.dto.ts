// src/question/dto/filter-questions.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class FilterQuestionsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  tags?: string; // comma-separated tag names (e.g. "js,node,web")
}
