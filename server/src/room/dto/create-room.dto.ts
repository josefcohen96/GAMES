import { IsString, Min, Max, IsIn, IsInt } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['eratz-ir', 'war'])
  gameType: string; // supported games

  @IsInt()
  @Min(2)
  @Max(10)
  maxPlayers: number;
  password?: string; // Optional field for password-protected rooms
}
