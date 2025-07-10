import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/base/base.repository';
import { Vote } from './entities/vote.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VoteRepository extends BaseRepository<Vote> {
  constructor(@InjectRepository(Vote) repo: Repository<Vote>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
