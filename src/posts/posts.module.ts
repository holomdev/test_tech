import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Comment])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
