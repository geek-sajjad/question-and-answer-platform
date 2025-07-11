import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class MarkAnswerCorrectDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the answer to mark as correct',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  answerId: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the user marking the answer as correct',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  userId: string;
}
