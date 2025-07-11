import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class MakeAnswerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Content of the answer',
    type: String,
    example:
      'You can implement a REST API in NestJS using controllers and services.',
  })
  content: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the user providing the answer',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  userId: string;
}
