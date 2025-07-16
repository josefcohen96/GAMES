
<<<<<<< HEAD
import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { Not } from 'typeorm';


export class RegisterDto {

  @IsNotEmpty()
=======
import { IsString, MinLength } from 'class-validator';


export class RegisterDto {
>>>>>>> fcf12ecd8ae1e65eaf27791908ac7b454a0bf3d3
  @IsString()
  @MinLength(3)
  username: string;

<<<<<<< HEAD
  @IsNotEmpty()
=======
>>>>>>> fcf12ecd8ae1e65eaf27791908ac7b454a0bf3d3
  @IsString()
  password: string;
}