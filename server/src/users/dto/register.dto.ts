
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}