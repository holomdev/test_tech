import axios from 'axios';
import { DataSource } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { Comment } from '../comments/entities/comment.entity';

export async function seedComments(dataSource: DataSource): Promise<void> {
  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);

  const posts = await axios.get(
    'https://jsonplaceholder.typicode.com/comments',
  );
  for (const commentData of posts.data) {
    const post = await postRepository.findOne({
      where: { id: commentData.postId },
    });

    const createCommentDto: CreateCommentDto = {
      body: commentData.body,
    };

    const comment = commentRepository.create({
      ...createCommentDto,
      email: commentData.email,
      name: commentData.name,
      post,
    });

    await commentRepository.save(comment);
  }
}
