
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/users/dto/login.dto';
import { RegisterDto } from 'src/users/dto/register.dto';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    this.logger.debug(`Validating user: ${username}`);
    if (user) {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(dto: LoginDto) {
    this.logger.debug(`Login attempt for user: ${dto.username}`);
    if (!dto.username || !dto.password) {
      throw new UnauthorizedException('Username and password are required');
    }
    const user = await this.validateUser(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      userId: user.id,
    };
  }

  async register(registerUserDto: RegisterDto) {
    if (!registerUserDto.username || !registerUserDto.password) {
      throw new UnauthorizedException('Username and password are required');
    }
    return this.usersService.createUser(registerUserDto);
  }
}
