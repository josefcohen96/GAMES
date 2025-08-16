import { IsString, MinLength } from 'class-validator';
export class LoginDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  password: string;
}
