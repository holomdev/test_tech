import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:
        process.env.NODE_ENV === 'test_e2e'
          ? 'localhost'
          : process.env.DATABASE_HOST,
      port:
        process.env.NODE_ENV === 'test_e2e' ? 5433 : +process.env.DATABASE_PORT,
      username:
        process.env.NODE_ENV === 'test_e2e'
          ? 'postgres'
          : process.env.DATABASE_USER,
      password:
        process.env.NODE_ENV === 'test_e2e'
          ? 'pass123'
          : process.env.DATABASE_PASSWORD,
      database:
        process.env.NODE_ENV === 'test_e2e'
          ? 'postgres'
          : process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'test_e2e' ? true : false,
    }),
    UsersModule,
    PostsModule,
    CommentsModule,
    IamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
