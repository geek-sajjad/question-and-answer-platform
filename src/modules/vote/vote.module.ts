import { Module } from '@nestjs/common';
import { AnswerModule } from '../answer/answer.module';
import { VoteRepository } from './vote.repository';
import { VoteService } from './vote.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { VoteController } from './vote.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vote]), AnswerModule],
  providers: [VoteRepository, VoteService],
  controllers: [VoteController],
})
export class VoteModule {}
