import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentService: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentService = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call method findAll in CommentsService', async () => {
    const paginationQuery: PaginationQueryDto = {
      limit: 10,
      offset: 0,
    };
    jest.spyOn(commentService, 'findAll');

    await controller.findAll(paginationQuery);

    expect(commentService.findAll).toHaveBeenCalledWith(paginationQuery);
  });

  it('should call method findOne in CommentsService', async () => {
    const commentId = '1';
    jest.spyOn(commentService, 'findOne');

    await controller.findOne(commentId);

    expect(commentService.findOne).toHaveBeenCalledWith(+commentId);
  });

  it('should call method update in CommentsService', async () => {
    const commentId = '1';
    const updateCommentDto: UpdateCommentDto = {
      body: 'a body comment',
    };
    const user: ActiveUserData = {
      sub: 1,
      email: 'test@example.com',
      name: 'name',
      username: 'username',
    };

    jest.spyOn(commentService, 'update');

    await controller.update(commentId, updateCommentDto, user);

    expect(commentService.update).toHaveBeenCalledWith(
      +commentId,
      updateCommentDto,
      user.email,
    );
  });

  it('should call method remove in CommentsService', async () => {
    const commentId = '1';
    const user: ActiveUserData = {
      sub: 1,
      email: 'test@example.com',
      name: 'name',
      username: 'username',
    };

    jest.spyOn(commentService, 'remove');

    await controller.remove(commentId, user);

    expect(commentService.remove).toHaveBeenCalledWith(+commentId, user.email);
  });
});
