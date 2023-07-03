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
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('posts')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Create a new post' })
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.create(createPostDto, +user.sub);
  }

  @ApiOperation({ summary: 'Create a comment to a post' })
  @ApiNotFoundResponse({ description: 'Post #ID not found' })
  @ApiParam({ name: 'id', description: 'Post ID' })
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

  @ApiOperation({ summary: 'Gets all posts' })
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.findAll(paginationQuery, +user.sub);
  }

  @ApiOperation({ summary: 'Gets all comments on a post' })
  @ApiNotFoundResponse({ description: 'Post #ID not found' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @Get(':id/comments')
  findAllComments(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.postsService.findAllComments(+id, paginationQuery);
  }

  @ApiOperation({ summary: 'Gets a specific post' })
  @ApiNotFoundResponse({ description: 'Post #ID not found' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @Get(':id')
  findOne(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.postsService.findOne(+id, +user.sub);
  }

  @ApiOperation({ summary: 'Update a specific post' })
  @ApiNotFoundResponse({ description: 'Post #ID not found' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.update(+id, updatePostDto, +user.sub);
  }

  @ApiOperation({ summary: 'Delete a specific post' })
  @ApiNotFoundResponse({ description: 'Post #ID not found' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.postsService.remove(+id, +user.sub);
  }
}
