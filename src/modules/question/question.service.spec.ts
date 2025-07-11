/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionRepository } from './question.repositotry';
import { TagRepository } from '../tag/tag.repository';
import { UserService } from '../user/user.services';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import { QuestionWithStats } from './interfaces/question.interface';
import { User } from '../user/entities/user.entity';

// Mock the pagination utility functions
jest.mock('../../shared/utils/pagination.util', () => ({
  getPaginationParams: jest.fn((page, limit) => ({
    safePage: page || 1,
    safeLimit: limit || 10,
    skip: ((page || 1) - 1) * (limit || 10),
  })),
  createPaginationMeta: jest.fn((totalItems, page, limit, itemCount) => ({
    totalItems,
    itemCount,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    hasNextPage: page * limit < totalItems,
    hasPreviousPage: page > 1,
  })),
}));

describe('QuestionService', () => {
  let service: QuestionService;
  let questionRepository: jest.Mocked<QuestionRepository>;
  let tagRepository: jest.Mocked<TagRepository>;
  let userService: jest.Mocked<UserService>;

  // Mock data
  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    // username: 'testuser',
    name: 'Test User',
    questions: [],
    answers: [],
    votes: [],
    createAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockTag = {
    id: 'tag-1',
    name: 'JavaScript',
    questions: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockQuestion: Question = {
    id: 'question-1',
    title: 'Test Question',
    description: 'Test Description',
    user: mockUser,
    tags: [mockTag],
    answers: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockQuestionWithStats: QuestionWithStats = {
    ...mockQuestion,
    answers: [],
  };

  beforeEach(async () => {
    const mockQuestionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findAllByTagsAndCount: jest.fn(),
      getOneWithVotesStatistics: jest.fn(),
      getStatistics: jest.fn(),
    };

    const mockTagRepository = {
      findByIds: jest.fn(),
    };

    const mockUserService = {
      findOneById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: QuestionRepository,
          useValue: mockQuestionRepository,
        },
        {
          provide: TagRepository,
          useValue: mockTagRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    questionRepository = module.get(QuestionRepository);
    tagRepository = module.get(TagRepository);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createQuestionDto: CreateQuestionDto = {
      title: 'Test Question',
      description: 'Test Description',
      tagIds: ['tag-1'],
      userId: 'user-1',
    };

    it('should create a question successfully', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(mockUser);
      tagRepository.findByIds.mockResolvedValue([mockTag]);
      questionRepository.create.mockReturnValue(mockQuestion);
      questionRepository.save.mockResolvedValue(mockQuestion);

      // Act
      const result = await service.create(createQuestionDto);

      // Assert
      expect(userService.findOneById).toHaveBeenCalledWith('user-1');
      expect(tagRepository.findByIds).toHaveBeenCalledWith(['tag-1']);
      expect(questionRepository.create).toHaveBeenCalledWith({
        title: 'Test Question',
        description: 'Test Description',
        tags: [mockTag],
        user: mockUser,
      });
      expect(questionRepository.save).toHaveBeenCalledWith(mockQuestion);
      expect(result).toEqual(mockQuestion);
    });

    it('should create a question without tags', async () => {
      // Arrange
      const dtoWithoutTags = { ...createQuestionDto, tagIds: undefined };
      userService.findOneById.mockResolvedValue(mockUser);
      questionRepository.create.mockReturnValue(mockQuestion);
      questionRepository.save.mockResolvedValue(mockQuestion);

      // Act
      const result = await service.create(dtoWithoutTags);

      // Assert
      expect(userService.findOneById).toHaveBeenCalledWith('user-1');
      expect(tagRepository.findByIds).not.toHaveBeenCalled();
      expect(questionRepository.create).toHaveBeenCalledWith({
        title: 'Test Question',
        description: 'Test Description',
        tags: [],
        user: mockUser,
      });
      expect(result).toEqual(mockQuestion);
    });

    it('should throw BadRequestException when user not found', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createQuestionDto)).rejects.toThrow(
        new BadRequestException('userId not found, please create user first'),
      );
      expect(userService.findOneById).toHaveBeenCalledWith('user-1');
      expect(tagRepository.findByIds).not.toHaveBeenCalled();
      expect(questionRepository.create).not.toHaveBeenCalled();
      expect(questionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const paginationDto: PaginationQueryDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated questions', async () => {
      // Arrange
      const mockQuestions = [mockQuestion];
      const totalItems = 1;
      questionRepository.findAndCount.mockResolvedValue([
        mockQuestions,
        totalItems,
      ]);

      // Act
      const result = await service.findAll(paginationDto);

      // Assert
      expect(questionRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['tags', 'answers'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: mockQuestions,
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      questionRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await service.findAll(paginationDto);

      // Assert
      expect(result).toEqual({
        data: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('findAllByTags', () => {
    const paginationDto: PaginationQueryDto = {
      page: 1,
      limit: 10,
    };
    const tags = 'javascript,typescript';

    it('should return paginated questions filtered by tags', async () => {
      // Arrange
      const mockQuestions = [mockQuestion];
      const totalItems = 1;
      questionRepository.findAllByTagsAndCount.mockResolvedValue([
        mockQuestions,
        totalItems,
      ]);

      // Act
      const result = await service.findAllByTags(paginationDto, tags);

      // Assert
      expect(questionRepository.findAllByTagsAndCount).toHaveBeenCalledWith(
        tags,
        0,
        10,
      );
      expect(result).toEqual({
        data: mockQuestions,
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should handle empty results for tag filtering', async () => {
      // Arrange
      questionRepository.findAllByTagsAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await service.findAllByTags(paginationDto, tags);

      // Assert
      expect(result).toEqual({
        data: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a question with stats', async () => {
      // Arrange
      const questionId = 'question-1';
      questionRepository.getOneWithVotesStatistics.mockResolvedValue(
        mockQuestionWithStats,
      );

      // Act
      const result = await service.findOne(questionId);

      // Assert
      expect(questionRepository.getOneWithVotesStatistics).toHaveBeenCalledWith(
        questionId,
      );
      expect(result).toEqual(mockQuestionWithStats);
    });

    it('should return null when question not found', async () => {
      // Arrange
      const questionId = 'non-existent-question';
      questionRepository.getOneWithVotesStatistics.mockResolvedValue(null);

      // Act
      const result = await service.findOne(questionId);

      // Assert
      expect(questionRepository.getOneWithVotesStatistics).toHaveBeenCalledWith(
        questionId,
      );
      expect(result).toBeNull();
    });
  });

  describe('statistics', () => {
    it('should return statistics with total answers', async () => {
      // Arrange
      const questionId = 'question-1';
      const mockStats: {
        id: string;
        total_answers: number;
      }[] = [{ id: 'question-1', total_answers: 5 }];
      questionRepository.getStatistics.mockResolvedValue(mockStats);

      // Act
      const result = await service.statistics(questionId);

      // Assert
      expect(questionRepository.getStatistics).toHaveBeenCalledWith(questionId);
      expect(result).toEqual({
        totalAnswers: 5,
        questionId: questionId,
      });
    });

    it('should return zero total answers when no statistics found', async () => {
      // Arrange
      const questionId = 'question-1';
      questionRepository.getStatistics.mockResolvedValue([]);

      // Act
      const result = await service.statistics(questionId);

      // Assert
      expect(questionRepository.getStatistics).toHaveBeenCalledWith(questionId);
      expect(result).toEqual({
        totalAnswers: 0,
        questionId: questionId,
      });
    });

    it('should handle empty statistics array', async () => {
      // Arrange
      const questionId = 'question-1';
      const mockStats: {
        id: string;
        total_answers: number;
      }[] = [{ id: 'question-1', total_answers: 0 }];
      questionRepository.getStatistics.mockResolvedValue(mockStats);

      // Act
      const result = await service.statistics(questionId);

      // Assert
      expect(result).toEqual({
        totalAnswers: 0,
        questionId: questionId,
      });
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      // Arrange
      const createQuestionDto: CreateQuestionDto = {
        title: 'Test Question',
        description: 'Test Description',
        tagIds: ['tag-1'],
        userId: 'user-1',
      };

      userService.findOneById.mockResolvedValue(mockUser);
      tagRepository.findByIds.mockResolvedValue([mockTag]);
      questionRepository.create.mockReturnValue(mockQuestion);
      questionRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(createQuestionDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should propagate user service errors', async () => {
      // Arrange
      const createQuestionDto: CreateQuestionDto = {
        title: 'Test Question',
        description: 'Test Description',
        tagIds: ['tag-1'],
        userId: 'user-1',
      };

      userService.findOneById.mockRejectedValue(
        new Error('User service error'),
      );

      // Act & Assert
      await expect(service.create(createQuestionDto)).rejects.toThrow(
        'User service error',
      );
    });
  });
});
