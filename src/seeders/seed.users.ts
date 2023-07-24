import { Module } from '@nestjs/common';
import axios from 'axios';
import { NestFactory } from '@nestjs/core';
import { HashingService } from '../iam/hashing/hashing.service';
import { User } from '../users/entities/user.entity';
import { BcryptService } from '../iam/hashing/bcrypt.service';
import { DataSource } from 'typeorm';

@Module({
  imports: [],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
})
class UserSeederModule {}

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const app = await NestFactory.createApplicationContext(UserSeederModule);
  const userRepository = dataSource.getRepository(User);
  const hashingService = app.get(HashingService);

  const users = await axios.get('https://jsonplaceholder.typicode.com/users');
  for (const userData of users.data) {
    const user = new User();
    user.name = userData.name;
    user.username = userData.username;
    user.email = userData.email;
    user.password = await hashingService.hash('Password12345');
    await userRepository.save(user);
  }

  await app.close();
}
