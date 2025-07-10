// import { CustomRepository } from 'typeorm-custom-repository';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/base/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entities/answer.entity';

@Injectable()
export class AnswerRepository extends BaseRepository<Answer> {
  constructor(@InjectRepository(Answer) repo: Repository<Answer>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
