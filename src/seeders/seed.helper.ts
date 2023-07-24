import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { seedUsers } from './seed.users';
import { seedPosts } from './seed.posts';
import { seedComments } from './seed.comments';

async function runSeeder() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  await seedUsers(dataSource);
  await seedPosts(dataSource);
  await seedComments(dataSource);
  await app.close();
}

runSeeder();
