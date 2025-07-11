import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/base/base.repository';
import { Question } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionWithStats } from './interfaces/question.interface';
// import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
// import { getPaginationParams } from '../../shared/utils/pagination.util';

@Injectable()
export class QuestionRepository extends BaseRepository<Question> {
  constructor(@InjectRepository(Question) repo: Repository<Question>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  findAllByTagsAndCount(tags: string, skip: number = 0, limit: number = 10) {
    // const { page, limit } = pagination;
    const tagNames = tags?.split(',').map((name) => name.trim());

    if (!tagNames?.length) {
      throw new BadRequestException('tags must to be empty');
    }

    // const { safeLimit, skip } = getPaginationParams(page, limit);

    const qb = this.createQueryBuilder('question')
      .leftJoinAndSelect('question.tags', 'tag')
      .leftJoinAndSelect('question.answers', 'answer')
      .orderBy('question.createdAt', 'DESC')
      .andWhere('tag.name IN (:...tagNames)', { tagNames })
      .skip(skip)
      .take(limit);

    return qb.getManyAndCount();
  }

  async getOneWithVotesStatistics(
    id: string,
  ): Promise<QuestionWithStats | null> {
    const question = (await this.createQueryBuilder('question')
      .leftJoinAndSelect('question.tags', 'tag')
      .leftJoinAndSelect('question.answers', 'answer')
      .leftJoinAndSelect('answer.user', 'answerUser')
      .leftJoinAndSelect('question.user', 'questionUser')
      .loadRelationCountAndMap(
        'answer.upvoteCount',
        'answer.votes',
        'upvotes',
        (qb) => qb.where('upvotes.voteType = :up', { up: 'UPVOTE' }),
      )
      .loadRelationCountAndMap(
        'answer.downvoteCount',
        'answer.votes',
        'downvotes',
        (qb) => qb.where('downvotes.voteType = :down', { down: 'DOWNVOTE' }),
      )
      .where('question.id = :id', { id })
      .getOne()) as QuestionWithStats;
    console.log(question);
    return question;
  }

  getStatistics(questionId: string): Promise<
    {
      id: string;
      total_answers: number;
    }[]
  > {
    return (
      this.createQueryBuilder('question')
        .select('question.id, count(question.id) as total_answers')
        // .select('*')
        .innerJoin('question.answers', 'answer')
        .where('question.id = :questionId', { questionId })
        .groupBy('question.id')
        .execute()
    );
  }
}
