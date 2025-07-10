import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/base/base.repository';
import { Question } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionRepository extends BaseRepository<Question> {
  constructor(@InjectRepository(Question) repo: Repository<Question>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
