import { DataSource } from 'typeorm';
import 'dotenv/config';
import { UsersTable1690069763031 } from './src/migrations/1690069763031-UsersTable';
import { PostsTable1690075468424 } from './src/migrations/1690075468424-PostsTable';
import { CommentsTable1690080787995 } from './src/migrations/1690080787995-CommentsTable';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  entities: [],
  migrations: [
    UsersTable1690069763031,
    PostsTable1690075468424,
    CommentsTable1690080787995,
  ],
});
