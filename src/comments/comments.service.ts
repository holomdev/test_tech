import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.commentRepository.find({
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, email: string) {
    const comment = await this.findOne(id);
    this.verifyCommentOwnership(comment, email);
    const updatedComment = { ...comment, ...updateCommentDto };
    return this.commentRepository.update(id, updatedComment);
  }

  async remove(id: number, email: string) {
    const comment = await this.findOne(id);
    this.verifyCommentOwnership(comment, email);
    return await this.commentRepository.remove(comment);
  }

  verifyCommentOwnership(comment: Comment, email: string) {
    if (comment.email !== email) {
      throw new UnauthorizedException(`This comment does not belong to you`);
    }
  }
}
