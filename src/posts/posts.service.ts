import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      select: ['id', 'email'],
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    const post = this.postRepository.create({ ...createPostDto, user });
    return await this.postRepository.save(post);
  }

  async createComment(
    id: number,
    createCommentDto: CreateCommentDto,
    userName: string,
    email: string,
  ) {
    const post = await this.postRepository.findOne({
      where: { id: id },
    });

    if (!post) {
      throw new NotFoundException(`Post #${id} not found`);
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      email: email,
      name: userName,
      post,
    });

    return this.commentRepository.save(comment);
  }

  async findAll(paginationQuery: PaginationQueryDto, userId: number) {
    const { limit, offset } = paginationQuery;
    return await this.postRepository.find({
      where: {
        user: { id: userId },
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: {
        id: id,
        user: { id: userId },
      },
    });
    if (!post) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.postRepository.findOne({
      where: {
        id: id,
        user: { id: userId },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post #${id} not found`);
    }

    const updatedPost = { ...post, ...updatePostDto };
    return await this.postRepository.save(updatedPost);
  }

  async remove(id: number, userId: number) {
    const post = await this.findOne(id, userId);
    return await this.postRepository.remove(post);
  }
}
