/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
});

const commentId = 1;
const email = 'test@example.com';
const comment = { id: commentId, email } as Comment;

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
        commentRepository.findOne.mockResolvedValueOnce(undefined);

        const promise = service.findOne(commentId);

        await expect(promise).rejects.toThrow(
          new NotFoundException(`Comment #${commentId} not found`),
        );
      });
    });
  });

  describe('findAll', () => {
    it('should find all comments', async () => {
      const paginationQuery = { limit: 10, offset: 0 };
      commentRepository.find.mockResolvedValueOnce([]);

      const result = await service.findAll(paginationQuery);

      expect(commentRepository.find).toHaveBeenCalledWith({
        skip: paginationQuery.offset,
        take: paginationQuery.limit,
      });

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    describe('when comment with ID exists', () => {
      it('should update a comment', async () => {
        const updateCommentDto = { body: 'Updated comment' };
        jest.spyOn(service, 'findOne').mockResolvedValueOnce(comment);
        jest
          .spyOn(service, 'verifyCommentOwnership')
          .mockImplementationOnce(() => {});
        const updateSpy = commentRepository.update.mockResolvedValueOnce({
          affected: 1,
        });

        const result = await service.update(commentId, updateCommentDto, email);

        expect(updateSpy).toHaveBeenCalledWith(commentId, {
          ...comment,
          ...updateCommentDto,
        });
        expect(result).toEqual({ affected: 1 });
      });
    });
    describe('otherwise', () => {
      it('should throw the "NotFoundException', async () => {
        const updateCommentDto = { body: 'Updated comment' };
        commentRepository.findOne.mockResolvedValueOnce(undefined);

        const promise = service.update(commentId, updateCommentDto, email);

        await expect(promise).rejects.toThrow(
          new NotFoundException(`Comment #${commentId} not found`),
        );
      });

      it('should throw the "UnauthorizedException', async () => {
        const updateCommentDto = { body: 'Updated comment' };
        const comment = {
          id: commentId,
          email: 'test2@example.com',
        } as Comment;
        jest.spyOn(service, 'findOne').mockResolvedValueOnce(comment);

        const promise = service.update(commentId, updateCommentDto, email);

        await expect(promise).rejects.toThrow(
          new UnauthorizedException(`This comment does not belong to you`),
        );
      });
    });
  });

  describe('remove', () => {
    it('when comment with ID exists', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(comment);
      jest
        .spyOn(service, 'verifyCommentOwnership')
        .mockImplementationOnce(() => {});
      const removeSpy = commentRepository.remove.mockResolvedValueOnce(comment);

      const result = await service.remove(commentId, email);

      expect(removeSpy).toHaveBeenCalledWith(comment);
      expect(result).toEqual(comment);
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException', async () => {
        commentRepository.findOne.mockResolvedValueOnce(undefined);
        jest
          .spyOn(service, 'verifyCommentOwnership')
          .mockImplementationOnce(() => {});

        const promise = service.remove(commentId, email);

        await expect(promise).rejects.toThrow(
          new NotFoundException(`Comment #${commentId} not found`),
        );
      });

      it('should throw the "UnauthorizedException', async () => {
        const comment = {
          id: commentId,
          email: 'test2@example.com',
        } as Comment;
        commentRepository.findOne.mockResolvedValueOnce(comment);

        const promise = service.remove(commentId, email);

        await expect(promise).rejects.toThrow(
          new UnauthorizedException(`This comment does not belong to you`),
        );
      });
    });
  });
});
