import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const user: ActiveUserData = {
  sub: 1,
  email: 'test@example.com',
  name: 'name',
  username: 'username',
};

const paginationQuery: PaginationQueryDto = {
  limit: 10,
  offset: 0,
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

  it('should call method findAll in PostsService', async () => {
    jest.spyOn(postsService, 'findAll');

    await controller.findAll(paginationQuery, user);

    expect(postsService.findAll).toHaveBeenCalledWith(
      paginationQuery,
      user.sub,
    );
  });

  it('should call method findAllComments in PostsService', async () => {
    const postId = '1';
    jest.spyOn(postsService, 'findAllComments');

    await controller.findAllComments(postId, paginationQuery);

    expect(postsService.findAllComments).toHaveBeenCalledWith(
      +postId,
      paginationQuery,
    );
  });

  it('should call method findOne in PostsService', async () => {
    const postId = '1';
    jest.spyOn(postsService, 'findOne');

    await controller.findOne(postId, user);

    expect(postsService.findOne).toHaveBeenCalledWith(+postId, user.sub);
  });

  it('should call method update in PostsService', async () => {
    const postId = '1';
    const updatePostDto: UpdatePostDto = {
      title: 'title',
      body: 'body',
    };
    jest.spyOn(postsService, 'update');

    await controller.update(postId, updatePostDto, user);

    expect(postsService.update).toHaveBeenCalledWith(
      +postId,
      updatePostDto,
      user.sub,
    );
  });

  it('should call method remove in PostsService', async () => {
    const postId = '1';
    jest.spyOn(postsService, 'remove');

    await controller.remove(postId, user);

    expect(postsService.remove).toHaveBeenCalledWith(+postId, user.sub);
  });
});
