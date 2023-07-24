import axios from 'axios';
import { DataSource } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from '../posts/dto/create-post.dto';

export async function seedPosts(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const postRepository = dataSource.getRepository(Post);

  const posts = await axios.get('https://jsonplaceholder.typicode.com/posts');
  for (const postData of posts.data) {
    const user = await userRepository.findOne({
      where: {
        id: postData.userId,
      },
      select: ['id', 'email'],
    });

    const createPostDto: CreatePostDto = {
      title: postData.title,
      body: postData.body,
    };

    const post = postRepository.create({
      ...createPostDto,
      user,
    });
    await postRepository.save(post);
  }
}
