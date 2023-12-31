import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { HashingService } from '../hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UnauthorizedException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
});

const signUpDto: SignUpDto = {
  name: 'test_name',
  email: 'test@example.com',
  username: 'username_test',
  password: 'password123',
};

const signInDto: SignInDto = {
  email: 'test@example.com',
  password: 'password123',
};

const user = {
  id: 1,
  email: 'test@example.com',
  password: 'some_hashing_password',
} as User;

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let hashingService: HashingService;
  let jwtService: JwtService;
  let userRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(jwtConfig)],
      providers: [
        AuthenticationService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    hashingService = module.get<HashingService>(HashingService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should a user signup', async () => {
      const hashingPass = 'some_hashing_password';
      jest.spyOn(hashingService, 'hash').mockResolvedValueOnce(hashingPass);
      userRepository.save.mockResolvedValueOnce(signUpDto);

      const result = await service.signUp(signUpDto);

      expect(userRepository.save).toHaveBeenCalledWith({
        ...signUpDto,
        password: hashingPass,
      });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    describe('otherwise', () => {
      it('should throw a Error', async () => {
        userRepository.save.mockRejectedValueOnce(new Error());

        const promise = service.signUp(signUpDto);

        await expect(promise).rejects.toThrowError();
      });
    });
  });

  describe('signIn', () => {
    it('should a user signin', async () => {
      const accessToken = 'access123';
      userRepository.findOneBy.mockResolvedValueOnce(user);
      jest.spyOn(hashingService, 'compare').mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce(accessToken);

      const result = await service.signIn(signInDto);

      expect(userRepository.findOneBy).toBeCalledWith({
        email: signInDto.email,
      });
      expect(userRepository.findOneBy).toBeCalledTimes(1);

      expect(hashingService.compare).toBeCalledWith(
        signInDto.password,
        user.password,
      );
      expect(hashingService.compare).toBeCalledTimes(1);

      expect(result).toEqual({
        accessToken,
      });
    });

    describe('otherwise', () => {
      it('should throw a UnauthorizedException when user does not exists', async () => {
        userRepository.findOneBy.mockResolvedValueOnce(undefined);

        const promise = service.signIn(signInDto);

        await expect(promise).rejects.toThrow(
          new UnauthorizedException('User does not exists'),
        );
      });

      it('should throw a UnauthorizedException when Password does not match', async () => {
        userRepository.findOneBy.mockResolvedValueOnce(user);
        jest.spyOn(hashingService, 'compare').mockResolvedValueOnce(false);

        const promise = service.signIn(signInDto);

        await expect(promise).rejects.toThrow(
          new UnauthorizedException('Password does not match'),
        );
      });
    });
  });
});
