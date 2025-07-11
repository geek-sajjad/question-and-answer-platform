import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import { QuestionService } from '../question/question.service';
import { VoteRepository } from './vote.repository';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AnswerService } from '../answer/answer.service';
import { UserService } from '../user/user.services';

@Injectable()
export class VoteService {
  constructor(
    private readonly voteRepository: VoteRepository,
    // @Inject(forwardRef(() => QuestionService))
    private readonly answerService: AnswerService,
    private readonly userService: UserService,
  ) {}

  async createVote(createVoteDto: CreateVoteDto) {
    const { voteType, answerId, userId } = createVoteDto;
    const answer = await this.answerService.findOne(answerId);

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`);
    }

    if (answer.user.id === userId) {
      throw new BadRequestException('You cannot vote your own answer');
    }

    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException(
        'userId not found, please create user first',
      );
    }
    const existingVote = await this.voteRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        answer: {
          id: answerId,
        },
      },
    });

    if (existingVote) {
      throw new BadRequestException('You already have voted on this');
    }
    const vote = this.voteRepository.create({
      voteType: voteType,
      answer,
      user,
    });
    return this.voteRepository.save(vote);
  }
}
