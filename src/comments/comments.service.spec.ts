import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
});

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<MockRepository>(getRepositoryToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    describe('when comment with ID exists', () => {
      it('should return the comment object', async () => {
        const commentId = 1;
        const comment = { id: commentId, body: 'Test comment' };

        commentRepository.findOne.mockResolvedValueOnce(comment);
        const result = await service.findOne(commentId);

        expect(commentRepository.findOne).toHaveBeenCalledWith({
          where: { id: commentId },
        });
        expect(commentRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(comment);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const commentId = 1;
        commentRepository.findOne.mockResolvedValueOnce(undefined);
        try {
          await service.findOne(commentId);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`Comment #${commentId} not found`);
        }
      });
    });
  });
});
