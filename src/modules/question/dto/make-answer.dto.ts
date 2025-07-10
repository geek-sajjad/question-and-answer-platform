import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class MakeAnswerDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
