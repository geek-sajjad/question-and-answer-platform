import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Tag } from '../../tag/entities/tag.entity';
import { Answer } from '../../answer/entities/answer.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the question',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Column()
  @ApiProperty({
    description: 'Title of the question',
    type: String,
    example: 'How to implement a REST API in NestJS?',
  })
  title: string;

  @Column('text')
  @ApiProperty({
    description: 'Detailed description of the question',
    type: String,
    example:
      'I need help understanding how to set up a REST API using NestJS with TypeORM.',
  })
  description: string;

  @ManyToOne(() => User, (user) => user.questions)
  @ApiProperty({
    description: 'User who created the question',
    type: () => User,
  })
  user: User;

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable()
  @ApiProperty({
    description: 'Tags associated with the question',
    type: () => [Tag],
    example: [
      { id: '1', name: 'NestJS' },
      { id: '2', name: 'TypeORM' },
    ],
  })
  tags: Tag[];

  @OneToMany(() => Answer, (answer) => answer.question)
  @ApiProperty({
    description: 'Answers to the question',
    type: () => [Answer],
    example: [
      {
        id: '1',
        content: 'You can use NestJS with TypeORM like this...',
        userId: '123',
      },
    ],
  })
  answers: Answer[];

  @CreateDateColumn()
  @ApiProperty({
    description: 'Timestamp when the question was created',
    type: String,
    format: 'date-time',
    example: '2025-07-11T17:15:00.000Z',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'Timestamp when the question was last updated',
    type: String,
    format: 'date-time',
    example: '2025-07-11T17:15:00.000Z',
  })
  updatedAt: Date;
}
