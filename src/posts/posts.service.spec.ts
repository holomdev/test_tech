import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const postId = 1;
const userId = 10;

const createPostDto: CreatePostDto = {
  title: 'Test Post',
  body: 'This is a test post',
};

const user = {
  id: userId,
  email: 'test@example.com',
} as User;

describe('PostsService', () => {
  let service: PostsService;
  let commentRepository: MockRepository;
  let postRepository: MockRepository;
  let userRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    commentRepository = module.get<MockRepository>(getRepositoryToken(Comment));
    postRepository = module.get<MockRepository>(getRepositoryToken(Post));
    userRepository = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    describe('when post with ID exists', () => {
      it('should return the post object', async () => {
        const post = {
          id: postId,
          title: 'post title',
          body: 'post body',
        };

        postRepository.findOne.mockReturnValueOnce(post);
        const result = await service.findOne(postId, userId);

        expect(postRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: postId,
            user: { id: userId },
          },
        });
        expect(postRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(post);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        postRepository.findOne.mockReturnValueOnce(undefined);
        const promise = service.findOne(postId, userId);

        await expect(promise).rejects.toThrow(
          new NotFoundException(`Post #${postId} not found`),
        );
      });
    });
  });

  describe('findAll', () => {
    it('should find all posts', async () => {
      const paginationQuery = { limit: 10, offset: 0 };

      postRepository.find.mockResolvedValueOnce([]);
      const result = await service.findAll(paginationQuery, userId);

      expect(postRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
        },
        skip: paginationQuery.offset,
        take: paginationQuery.limit,
      });

      expect(postRepository.find).toHaveBeenCalledTimes(1);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    describe('when user exists', () => {
      it('should create a post', async () => {
        const post = {
          ...createPostDto,
          user,
        } as Post;

        userRepository.findOne.mockReturnValueOnce(user);
        postRepository.create.mockReturnValueOnce(post);
        postRepository.save.mockReturnValueOnce(post);

        const result = await service.create(createPostDto, userId);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          select: ['id', 'email'],
        });
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);

        expect(postRepository.create).toHaveBeenCalledWith({
          ...createPostDto,
          user,
        });
        expect(postRepository.create).toHaveBeenCalledTimes(1);

        expect(postRepository.save).toHaveBeenCalledWith(post);
        expect(postRepository.save).toHaveBeenCalledTimes(1);

        expect(result).toEqual(post);
      });
    });

    describe('otherwise', () => {
      it('should throw a NotFoundException', async () => {
        userRepository.findOne.mockReturnValueOnce(undefined);

        const promise = service.create(createPostDto, userId);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          select: ['id', 'email'],
        });
        await expect(promise).rejects.toThrow(
          new NotFoundException(`User #${userId} not found`),
        );
      });
    });
  });

  describe('update', () => {
    describe('when post with ID exists', () => {
      it('should update a post', async () => {
        const updatePostDto: UpdatePostDto = {
          body: 'a new body',
        };
        const post = {
          id: postId,
          title: 'title post',
          body: 'body post',
        } as Post;

        jest.spyOn(service, 'findOne').mockResolvedValueOnce(post);
        postRepository.save.mockResolvedValueOnce({
          affected: 1,
        });

        const result = await service.update(postId, updatePostDto, userId);
        expect(service.findOne).toHaveBeenCalledWith(postId, userId);
        expect(service.findOne).toHaveBeenCalledTimes(1);
        expect(postRepository.save).toHaveBeenCalledWith({
          ...post,
          ...updatePostDto,
        });
        expect(postRepository.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          affected: 1,
        });
      });
    });

    describe('otherwise', () => {
      it('should throw a NotFoundException', async () => {
        const updatePostDto: UpdatePostDto = {
          body: 'a new body',
        };

        postRepository.findOne.mockResolvedValueOnce(undefined);
        const promise = service.update(postId, updatePostDto, userId);

        expect(postRepository.findOne).toHaveBeenCalledTimes(1);
        await expect(promise).rejects.toThrow(
          new NotFoundException(`Post #${postId} not found`),
        );
      });
    });
  });

  describe('remove', () => {
    describe('when post with ID exists', () => {
      it('should remove a post', async () => {
        const post = {
          id: postId,
          title: 'Test Post',
          body: 'This is a test post',
          user,
        } as Post;

        postRepository.findOne.mockReturnValueOnce(post);
        postRepository.remove.mockReturnValueOnce(post);
        const result = await service.remove(postId, userId);

        expect(postRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: postId,
            user: { id: userId },
          },
        });
        expect(postRepository.findOne).toHaveBeenCalledTimes(1);

        expect(postRepository.remove).toHaveBeenCalledWith(post);
        expect(postRepository.remove).toBeCalledTimes(1);

        expect(result).toEqual(post);
      });
    });

    describe('otherwise', () => {
      it('should throw a NotFoundException', async () => {
        postRepository.findOne.mockResolvedValueOnce(undefined);
        const promise = service.remove(postId, userId);

        expect(postRepository.findOne).toHaveBeenCalledTimes(1);
        await expect(promise).rejects.toThrow(
          new NotFoundException(`Post #${postId} not found`),
        );
      });
    });
  });

  describe('createComment', () => {
    describe('when post with ID exists', () => {
      it('should create comment from post', async () => {
        const createCommentDto: CreateCommentDto = {
          body: 'this is a example comment',
        };
        const userName = 'test_name';
        const email = 'test@example.com';
        const post = {
          id: postId,
          title: 'Test Post',
          body: 'This is a test post',
        } as Post;

        const comment = {
          ...createCommentDto,
          email,
          name: userName,
          post,
        } as Comment;

        postRepository.findOne.mockResolvedValueOnce(post);
        commentRepository.create.mockResolvedValueOnce(comment);
        commentRepository.save.mockResolvedValueOnce(comment);

        const result = await service.createComment(
          postId,
          createCommentDto,
          userName,
          email,
        );

        expect(postRepository.findOne).toHaveBeenCalledWith({
          where: { id: postId },
        });
        expect(postRepository.findOne).toHaveBeenCalledTimes(1);

        expect(commentRepository.create).toHaveBeenCalledWith(comment);
        expect(commentRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual(comment);
      });
    });

    describe('otherwise', () => {
      it('should throw a NotFoundException', async () => {
        const createCommentDto: CreateCommentDto = {
          body: 'this is a example comment',
        };
        const userName = 'test_name';
        const email = 'test@example.com';

        postRepository.findOne.mockResolvedValueOnce(undefined);

        const promise = service.createComment(
          postId,
          createCommentDto,
          userName,
          email,
        );

        await expect(promise).rejects.toThrow(
          new NotFoundException(`Post #${postId} not found`),
        );
      });
    });
  });

  describe('findAllComments', () => {
    describe('when post with ID exists', () => {
      it('should find comments from post', async () => {
        const paginationQuery = { limit: 10, offset: 0 };
        commentRepository.find.mockResolvedValueOnce([]);

        const result = await service.findAllComments(postId, paginationQuery);

        expect(commentRepository.find).toHaveBeenCalledWith({
          where: {
            post: { id: postId },
          },
          skip: paginationQuery.offset,
          take: paginationQuery.limit,
        });

        expect(result).toEqual([]);
      });
    });
  });
});
