import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { HashingService } from '../hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { SignUpDto } from './dto/sign-up.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let jwtConfiguration: ConfigType<typeof jwtConfig>;
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
    jwtConfiguration = module.get<ConfigType<typeof jwtConfig>>(jwtConfig.KEY);
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
      const signUpDto: SignUpDto = {
        name: 'test_name',
        email: 'test@example.com',
        username: 'username_test',
        password: 'password123',
      };

      hashingService.hash = jest.fn().mockResolvedValueOnce(hashingPass);
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
        const signUpDto: SignUpDto = {
          name: 'test_name',
          email: 'test@example.com',
          username: 'username_test',
          password: 'password123',
        };
        userRepository.save.mockRejectedValueOnce(new Error());

        const promise = service.signUp(signUpDto);
        await expect(promise).rejects.toThrowError();
      });
    });
  });
});
