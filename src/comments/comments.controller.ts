import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Gets all comments' })
  @Get()
  @Auth(AuthType.None)
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.commentsService.findAll(paginationQuery);
  }

  @ApiOperation({ summary: 'Get a specific comment' })
  @Get(':id')
  @Auth(AuthType.None)
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a comment, you have to be the owner' })
  @ApiNotFoundResponse({ description: 'Comment #${id} not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.commentsService.update(+id, updateCommentDto, user.email);
  }

  @ApiOperation({ summary: 'Delete a comment, you have to be the owner' })
  @ApiNotFoundResponse({ description: 'Comment #${id} not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.commentsService.remove(+id, user.email);
  }
}
