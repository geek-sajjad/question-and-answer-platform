import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { Question } from './entities/question.entity';
import { QuestionRepository } from './question.repositotry';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [TagModule, TypeOrmModule.forFeature([Question])],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionRepository],
})
export class QuestionModule {}
