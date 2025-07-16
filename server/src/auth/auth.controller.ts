import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/users/dto/login.dto';
import { Public } from './decorator/public.decorator';
import { RegisterDto } from 'src/users/dto/register.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginUserDto: LoginDto) {
    return this.authService.login(loginUserDto);
  }
<<<<<<< HEAD

=======
>>>>>>> fcf12ecd8ae1e65eaf27791908ac7b454a0bf3d3
  @Post('register')
  async register(@Body() registerUserDto: RegisterDto) {
    return this.authService.register(registerUserDto);
  }
}
