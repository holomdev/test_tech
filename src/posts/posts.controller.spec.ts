import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

const user: ActiveUserData = {
  sub: 1,
  email: 'test@example.com',
  name: 'name',
  username: 'username',
};

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn(),
            createComment: jest.fn(),
            findAll: jest.fn(),
            findAllComments: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call method create in PostsService', async () => {
    const createPostDto: CreatePostDto = {
      title: 'title',
      body: 'body',
    };

    jest.spyOn(postsService, 'create');

    await controller.create(createPostDto, user);

    expect(postsService.create).toHaveBeenCalledWith(createPostDto, user.sub);
  });

  it('should call method createComment in PostsService', async () => {
    const postId = '1';
    const createCommentDto: CreateCommentDto = {
      body: 'body comment',
    };

    jest.spyOn(postsService, 'createComment');

    await controller.createComment(postId, createCommentDto, user);

    expect(postsService.createComment).toHaveBeenCalledWith(
      +postId,
      createCommentDto,
      user.username,
      user.email,
    );
  });
});
