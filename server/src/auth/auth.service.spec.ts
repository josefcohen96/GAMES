import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';
import { RegisterDto } from '../users/dto/register.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOne: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toEqual({
        id: '1',
        username: 'testuser',
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('testuser');
    });

    it('should return null when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        username: 'testuser',
      };

      const mockToken = 'jwt-token';

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: mockToken,
        userId: '1',
      });
      expect(service.validateUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: '1',
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when username or password is missing', async () => {
      const loginDto: LoginDto = {
        username: '',
        password: 'password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        password: 'password123',
      };

      const mockResult = { message: 'User created successfully' };

      mockUsersService.createUser.mockResolvedValue(mockResult);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockResult);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(registerDto);
    });

    it('should throw UnauthorizedException when username or password is missing', async () => {
      const registerDto: RegisterDto = {
        username: '',
        password: 'password123',
      };

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});

