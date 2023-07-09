import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('[Feature] Posts - /posts (e2e)', () => {
  let app: INestApplication;

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

  it.todo('create [POST /]');
  it.todo('createComment [POST /:id/comments]');
  it.todo('findAll [GET /]');
  it.todo('findAllComments [GET /:id/comments]');
  it.todo('findOne [GET /:id]');
  it.todo('update [PATCH /:id]');
  it.todo('remove [DELETE /:id]');

  afterAll(async () => {
    await app.close();
  });
});
