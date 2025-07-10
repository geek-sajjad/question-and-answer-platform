import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VoteService } from './vote.service';

@Controller('votes')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @HttpCode(200)
  @Post()
  async makeVote(@Body() dto: CreateVoteDto): Promise<void> {
    const { answerId, voteType } = dto;
    await this.voteService.createVote({
      answerId: answerId,
      voteType: voteType,
    });
  }
}
