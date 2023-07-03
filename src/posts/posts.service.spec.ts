import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
});

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
      it('should return the comment object', async () => {
        const postId = 1;
        const userId = 1;
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
  });
});