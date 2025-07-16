
import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { Not } from 'typeorm';


export class RegisterDto {

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}