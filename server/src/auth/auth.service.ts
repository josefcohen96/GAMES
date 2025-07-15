
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/users/dto/login.dto';
import { RegisterDto } from 'src/users/dto/register.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    console.log('Validating user:', username);
    if (user) {
      console.log('pass1, pass2:', pass, user.password);

      const isPasswordValid = await bcrypt.compare(pass, user.password);
      console.log('Password valid:', isPasswordValid);
      if (isPasswordValid) {
        const { password, ...result } = user;
        console.log('User validated:', result);
        return result;
      }
      console.log('Invalid password for user:', username);
    }
    return null;
  }

  async login(dto: LoginDto) {
    console.log('Login attempt for user:', dto.username);
    if (!dto.username || !dto.password) {
      throw new UnauthorizedException('Username and password are required');
    }
    const user = await this.validateUser(dto.username, dto.password);
    console.log('User found:', user);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    console.log('User logged in:', user.username);
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: RegisterDto) {
    console.log('Registering user:', userDto);
    if (!userDto.username || !userDto.password) {
      console.log('Missing username or password:', userDto);
      throw new UnauthorizedException('Username and password are required');
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    console.log('Hashed password:', hashedPassword);
    const newUser = {
      ...userDto,
      password: hashedPassword,
    };
    console.log('Hashed password:', newUser.password);
    return this.usersService.createUser(newUser);
  }
}
