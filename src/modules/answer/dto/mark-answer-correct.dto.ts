import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class MarkAnswerCorrectDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  answerId: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  questionId: string;
}
