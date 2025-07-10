import { Injectable, NotFoundException } from '@nestjs/common';
// import { QuestionService } from '../question/question.service';
import { VoteRepository } from './vote.repository';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AnswerService } from '../answer/answer.service';

@Injectable()
export class VoteService {
  constructor(
    private readonly voteRepository: VoteRepository,
    // @Inject(forwardRef(() => QuestionService))
    private readonly answerService: AnswerService,
  ) {}

  async createVote(createVoteDto: CreateVoteDto) {
    const { voteType, answerId } = createVoteDto;
    const answer = await this.answerService.findOne(answerId);

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`);
    }

    const vote = this.voteRepository.create({
      voteType: voteType,
      answer,
    });
    return this.voteRepository.save(vote);
  }
}
