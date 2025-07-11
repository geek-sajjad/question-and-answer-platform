import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { Question } from './entities/question.entity';
import { QuestionRepository } from './question.repositotry';
import { TagModule } from '../tag/tag.module';
import { AnswerModule } from '../answer/answer.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => AnswerModule),
    UserModule,
    TagModule,
    TypeOrmModule.forFeature([Question]),
  ],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionRepository],
  exports: [QuestionService],
})
export class QuestionModule {}
