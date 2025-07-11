import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Title of the question',
    type: String,
    example: 'How to implement a REST API in NestJS?',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Detailed description of the question',
    type: String,
    example:
      'I need help understanding how to set up a REST API using NestJS with TypeORM.',
  })
  description: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  @ApiProperty({
    description: 'Array of tag IDs associated with the question',
    type: [String],
    format: 'uuid',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    required: false,
  })
  tagIds?: string[];

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the user creating the question',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  userId: string;
}
