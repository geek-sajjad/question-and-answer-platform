import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Answer } from './entities/answer.entity';
import { AnswerService } from './answer.service';
import { AnswerRepository } from './answer.repository';
import { QuestionModule } from '../question/question.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => QuestionModule),
    UserModule,
    TypeOrmModule.forFeature([Answer]),
  ],
  providers: [AnswerService, AnswerRepository],
  exports: [AnswerService, AnswerRepository],
})
export class AnswerModule {}
