import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { SignUpDto } from '../../src/iam/authentication/dto/sign-up.dto';
import { SignInDto } from '../../src/iam/authentication/dto/sign-in.dto';
import { CreatePostDto } from '../../src/posts/dto/create-post.dto';
import { Comment } from '../../src/comments/entities/comment.entity';

const post: CreatePostDto = {
  title: 'Title post',
  body: 'Body post',
};

describe('[Feature] Comments - /comments (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let commentId: number;
  let postId: number;

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

  describe('Pots', () => {
    it('create [POST /]: should create a post', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send(post)
        .expect(HttpStatus.CREATED);

      const data = response.body;
      postId = data.id;
      expect(data.title).toBeDefined();
      expect(data.body).toBeDefined();
    });

    it('createComment [POST /:id/comments]: should create a comment', async () => {
      const response = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send({
          body: 'body comment',
        })
        .expect(HttpStatus.CREATED);

      const comment = response.body;
      commentId = comment.id;
      expect(comment.body).toBeDefined();
    });
  });

  describe('Comments', () => {
    it('findAll [GET /]: should return all comments', async () => {
      const response = await request(app.getHttpServer())
        .get('/comments')
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.OK);
      const data = response.body;
      const comment: Comment = data[0];
      expect(data).toHaveLength(1);
      expect(comment.body).toBeDefined();
    });

    it('findOne [GET /]: should return a comment', async () => {
      const response = await request(app.getHttpServer())
        .get(`/comments/${commentId}`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.OK);
      const comment: Comment = response.body;
      expect(comment.name).toBeDefined();
      expect(comment.body).toBeDefined();
      expect(comment.email).toBeDefined();
      expect(comment.id).toBeDefined();
    });

    it('update [PATCH /:id]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .patch(`/comments/${commentId}`)
        .send({
          body: 'update comment',
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('update [PATCH /:id]: should update a comment', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/comments/${commentId}`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send({
          body: 'update comment',
        })
        .expect(HttpStatus.OK);
      const comment = response.body;
      expect(comment.affected).toBeDefined();
    });

    it('update [PATCH /:id]: should throw an error for comment not found', async () => {
      const postId = 1000;
      return await request(app.getHttpServer())
        .patch(`/comments/${postId}`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .send({
          body: 'update comment',
        })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: `Comment #${postId} not found`,
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('remove [DELETE /:id]: should throw an error for unauthenticated request', async () => {
      return await request(app.getHttpServer())
        .delete(`/comments/${commentId}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('remove [DELETE /:id]: should throw an error for comment not found', async () => {
      const commentId = 1000;
      return await request(app.getHttpServer())
        .delete(`/comments/${commentId}`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: `Comment #${commentId} not found`,
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('remove [DELETE /:id]: should delete a comment', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/comments/${commentId}`)
        .set({
          Authorization: 'Bearer ' + jwtToken,
          Accept: 'application/json',
        })
        .expect(HttpStatus.OK);
      const comment: Comment = response.body;
      expect(comment.body).toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
