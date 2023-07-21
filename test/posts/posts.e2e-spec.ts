import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { SignUpDto } from '../../src/iam/authentication/dto/sign-up.dto';
import { SignInDto } from '../../src/iam/authentication/dto/sign-in.dto';
import { CreatePostDto } from '../../src/posts/dto/create-post.dto';
import { Post } from '../../src/posts/entities/post.entity';
import { Comment } from '../../src/comments/entities/comment.entity';
import { UpdatePostDto } from '../../src/posts/dto/update-post.dto';

const post: CreatePostDto = {
  title: 'Title post',
  body: 'Body post',
};

describe('[Feature] Posts - /posts (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  describe('Authentication', () => {
    it('sign-up [POST /]: should register user', async () => {
      const user: SignUpDto = {
        name: 'test_name',
        email: 'test@example.com',
        username: 'username_test',
        password: 'password123',
      };
      return await request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send(user)
        .expect(HttpStatus.CREATED);
    });

    it('sign-in [POST /]: should return accessToken for correct username and password', async () => {
      const credentials: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const response = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send(credentials)
        .expect(HttpStatus.OK);

      jwtToken = response.body.accessToken;

      expect(jwtToken).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      );
    });
  });

  describe('Posts', () => {
    it('create [POST /]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .post('/posts')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('create [POST /]: should create a post', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send(post)
        .expect(HttpStatus.CREATED);

      const { title, body } = response.body;

      expect(title).toBeDefined();
      expect(body).toBeDefined();
    });

    it('findAll [GET /]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .get('/posts')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('findAll [GET /]: should return all post', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.OK);
      const data = response.body;
      const post = data[0] as Post;
      expect(data).toHaveLength(1);
      expect(post.id).toBeDefined();
      expect(post.title).toBeDefined();
    });

    it('findOne [GET /:id]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .get('/posts/1')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('findOne [GET /:id]: should return a post', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/1')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.OK);
      const post = response.body;
      expect(post.title).toBeDefined();
      expect(post.body).toBeDefined();
    });

    it('findOne [GET /:id]: should throw an error for post not found', async () => {
      const postId = 1000;
      return await request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: `Post #${postId} not found`,
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('createComment [POST /:id/comments]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .post('/posts/1/comments')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('createComment [POST /:id/comments]: should create a comment', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts/1/comments')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send({
          body: 'body comment',
        })
        .expect(HttpStatus.CREATED);

      const comment = response.body;
      expect(comment.body).toBeDefined();
    });

    it('createComment [POST /:id/comments]: should throw an error for post not found', async () => {
      const postId = 1000;
      return await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send({
          body: 'body comment',
        })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: `Post #${postId} not found`,
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('findAllComments [GET /:id/comments]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .get('/posts/1/comments')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('findAllComments [GET /:id/comments]: should return all comments', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/1/comments')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.OK);
      const data = response.body;
      const comment = data[0] as Comment;
      expect(data).toHaveLength(1);
      expect(comment.body).toBeDefined();
    });

    it('update [PATCH /:id]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .patch('/posts/1')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('update [PATCH /:id]: should update post', async () => {
      const updatePost: UpdatePostDto = {
        title: 'new title',
        body: 'new body',
      };
      const response = await request(app.getHttpServer())
        .patch('/posts/1')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send(updatePost)
        .expect(HttpStatus.OK);
      const post = response.body;
      expect(post.title).toBeDefined();
      expect(post.body).toBeDefined();
    });

    it('update [PATCH /:id]: should throw an error for post not found', async () => {
      const postId = 1000;
      const updatePost: UpdatePostDto = {
        title: 'new title',
        body: 'new body',
      };

      return await request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send(updatePost)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: `Post #${postId} not found`,
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('remove [DELETE /:id]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .delete('/posts/1')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('remove [DELETE /:id]: should delete post', async () => {
      const response = await request(app.getHttpServer())
        .delete('/posts/1')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.OK);

      const post = response.body;
      expect(post.title).toBeDefined();
      expect(post.body).toBeDefined();
    });

    it('remove [DELETE /:id]: should throw an error for post not found', async () => {
      const postId = 1000;
      return await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: `Post #${postId} not found`,
          error: 'Not Found',
          statusCode: 404,
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
