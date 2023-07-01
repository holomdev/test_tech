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

  findOne(id: number) {
    return this.commentRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, email: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    if (comment.email !== email) {
      throw new UnauthorizedException(`This comment does not belong to you`);
    }

    return this.commentRepository.update(id, updateCommentDto);
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
