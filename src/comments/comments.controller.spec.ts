import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

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
});
