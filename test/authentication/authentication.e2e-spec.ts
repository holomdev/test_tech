import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { SignUpDto } from '../../src/iam/authentication/dto/sign-up.dto';
import { SignInDto } from '../../src/iam/authentication/dto/sign-in.dto';

describe('[Feature] Authentication - /authentication (e2e)', () => {
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

  it('sign-up [POST /]: should throw an error for a duplicate email', async () => {
    const user: SignUpDto = {
      name: 'test_name',
      email: 'test@example.com',
      username: 'username_test',
      password: 'password123',
    };
    return await request(app.getHttpServer())
      .post('/authentication/sign-up')
      .send(user)
      .then(({ body }) => {
        expect(body).toEqual({
          message: 'Conflict',
          statusCode: 409,
        });
        expect(HttpStatus.CONFLICT);
      });
  });

  it('sign-up [POST /]: should throw an error for a bad email', async () => {
    const user: SignUpDto = {
      name: 'test_name',
      email: 'testexample.com',
      username: 'username_test',
      password: 'password123',
    };
    return await request(app.getHttpServer())
      .post('/authentication/sign-up')
      .send(user)
      .then(({ body }) => {
        expect(body).toEqual({
          message: ['email must be an email'],
          error: 'Bad Request',
          statusCode: 400,
        });
        expect(HttpStatus.BAD_REQUEST);
      });
  });

  it('sign-up [POST /]: should throw an error for a bad password', async () => {
    const user: SignUpDto = {
      name: 'test_name',
      email: 'test@example.com',
      username: 'username_test',
      password: '',
    };
    return await request(app.getHttpServer())
      .post('/authentication/sign-up')
      .send(user)
      .then(({ body }) => {
        expect(body).toEqual({
          message: ['password must be longer than or equal to 10 characters'],
          error: 'Bad Request',
          statusCode: 400,
        });
        expect(HttpStatus.BAD_REQUEST);
      });
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

    const jwtToken = response.body.accessToken;

    expect(jwtToken).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
    );
  });

  it('sign-in [POST /]: should throw an error for bad email', async () => {
    return await request(app.getHttpServer())
      .post('/authentication/sign-in')
      .send({
        email: 'bademail.com',
        password: 'Password123',
      })
      .then(({ body }) => {
        expect(body).toEqual({
          message: ['email must be an email'],
          error: 'Bad Request',
          statusCode: 400,
        });
        expect(HttpStatus.BAD_REQUEST);
      });
  });

  it('sign-in [POST /]: should throw an error for non-existent user', async () => {
    return await request(app.getHttpServer())
      .post('/authentication/sign-in')
      .send({
        email: 'another_uer@email.com',
        password: 'Password123',
      })
      .then(({ body }) => {
        expect(body).toEqual({
          message: 'User does not exists',
          error: 'Unauthorized',
          statusCode: 401,
        });
        expect(HttpStatus.UNAUTHORIZED);
      });
  });

  it('sign-in [POST /]: should throw an error for incorrect password', async () => {
    return await request(app.getHttpServer())
      .post('/authentication/sign-in')
      .send({
        email: 'test@example.com',
        password: 'Password1234',
      })
      .then(({ body }) => {
        expect(body).toEqual({
          message: 'Password does not match',
          error: 'Unauthorized',
          statusCode: 401,
        });
        expect(HttpStatus.UNAUTHORIZED);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
