import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.create(createPostDto, +user.sub);
  }

  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const { username, email } = user;
    return this.postsService.createComment(
      +id,
      createCommentDto,
      username,
      email,
    );
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.findAll(paginationQuery, +user.sub);
  }

  @Get(':id/comments')
  findAllComments(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.postsService.findAllComments(+id, paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.postsService.findOne(+id, +user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.update(+id, updatePostDto, +user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.postsService.remove(+id, +user.sub);
  }
}
