import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // async create(createCommentDto: CreateCommentDto, email: string) {
  //   const { postId, ...commentData } = createCommentDto;
  //   const post = await this.postRepository.findOne({
  //     where: { id: postId },
  //   });

  //   if (!post) {
  //     throw new NotFoundException(`Post #${postId} not found`);
  //   }

  //   const comment = this.commentRepository.create({
  //     ...commentData,
  //     post,
  //   });

  //   return this.commentRepository.save(comment);
  // }

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
