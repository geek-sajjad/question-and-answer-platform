import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { VoteType } from '../vote.enums';

export class CreateVoteDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  answerId: string;

  @IsEnum(VoteType)
  @IsString()
  @IsNotEmpty()
  voteType: VoteType;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
